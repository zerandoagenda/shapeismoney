import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calculateRadarScore, type RadarQuestion } from "@/lib/radar-score";
import { radarAnalysisSchema, type RadarAnalysis } from "@/lib/radar-analysis.server";

const identificationSchema = z.object({
  fullName: z.string().trim().min(3).max(140), whatsapp: z.string().trim().min(8).max(30), email: z.string().trim().email().max(180),
  age: z.number().int().min(18).max(100), jobTitle: z.string().trim().min(2).max(120), company: z.string().trim().min(2).max(160), segment: z.string().trim().min(2).max(120),
  consent: z.literal(true), website: z.string().max(0), source: z.string().max(100).optional(), utmSource: z.string().max(200).optional(), utmMedium: z.string().max(200).optional(), utmCampaign: z.string().max(200).optional(), utmContent: z.string().max(200).optional(), utmTerm: z.string().max(200).optional(), referrer: z.string().max(1000).optional(), landingPage: z.string().max(1000).optional(),
});
const accessSchema = z.object({ sessionId: z.string().uuid(), secret: z.string().min(32).max(200) });
const statuses = ["NEW","RADAR_STARTED","RADAR_COMPLETED","WHATSAPP_CLICKED","QUALIFIED","OPPORTUNITY","CLIENT","DISQUALIFIED"] as const;

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function token() { return `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`; }
async function adminClient() { const { supabaseAdmin } = await import("@/integrations/supabase/client.server"); return supabaseAdmin; }
async function requireSession(admin: any, sessionId: string, secret: string) {
  const hash = await sha256(secret);
  const { data } = await admin.from("radar_sessions").select("*,radar_leads(*)").eq("id", sessionId).eq("session_secret_hash", hash).maybeSingle();
  if (!data) throw new Error("Sua sessão do Radar não foi encontrada.");
  return data;
}
async function requireStaff(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
  if (!data?.some((row: { role: string }) => ["coach","manager","admin","admin_master","relationship","analyst","support"].includes(row.role))) throw new Error("Acesso restrito à equipe.");
  return data;
}

export const getRadarPublicConfig = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await adminClient();
  const [{ data: settings }, { data: questions }] = await Promise.all([
    admin.from("radar_settings").select("campaign_active,video_url,active_version,cta_text").eq("id", true).single(),
    admin.from("radar_questions").select("id,question_key,pillar,position,prompt,low_label,high_label,reverse_scored").eq("active", true).order("position"),
  ]);
  return { settings, questions: questions ?? [] };
});

export const trackRadarVisit = createServerFn({ method: "POST" }).inputValidator((input: unknown) => z.object({ visitorId: z.string().min(16).max(100), source: z.string().max(100).optional(), utmSource: z.string().max(200).optional(), utmMedium: z.string().max(200).optional(), utmCampaign: z.string().max(200).optional(), landingPage: z.string().max(1000).optional() }).parse(input)).handler(async ({ data }) => {
  const admin = await adminClient(); const visitorHash = await sha256(data.visitorId); const since = new Date(Date.now() - 86400000).toISOString();
  const { data: existing } = await admin.from("radar_visits").select("id").eq("visitor_hash", visitorHash).gte("visited_at", since).limit(1).maybeSingle();
  if (!existing) await admin.from("radar_visits").insert({ visitor_hash: visitorHash, source: data.source ?? "direct", utm_source: data.utmSource ?? null, utm_medium: data.utmMedium ?? null, utm_campaign: data.utmCampaign ?? null, landing_page: data.landingPage ?? null });
  return { ok: true };
});

export const createRadarLead = createServerFn({ method: "POST" }).inputValidator((input: unknown) => identificationSchema.parse(input)).handler(async ({ data }) => {
  const admin = await adminClient(); const sessionSecret = token(); const resultToken = token(); const now = new Date().toISOString();
  const { count } = await admin.from("radar_leads").select("id", { count: "exact", head: true }).eq("email", data.email.toLowerCase()).gte("created_at", new Date(Date.now() - 300000).toISOString());
  if ((count ?? 0) >= 3) throw new Error("Aguarde alguns minutos antes de iniciar novamente.");
  const { data: settings } = await admin.from("radar_settings").select("campaign_active,active_version").eq("id", true).single();
  if (!settings?.campaign_active) throw new Error("O Radar está temporariamente indisponível.");
  const { data: lead, error } = await admin.from("radar_leads").insert({ full_name: data.fullName, whatsapp: data.whatsapp, email: data.email.toLowerCase(), age: data.age, job_title: data.jobTitle, company: data.company, segment: data.segment, source: data.source ?? data.utmSource ?? "direct", consent_at: now }).select("id").single();
  if (error || !lead) throw error ?? new Error("Não foi possível iniciar o Radar.");
  const { data: session, error: sessionError } = await admin.from("radar_sessions").insert({ lead_id: lead.id, radar_version: settings.active_version, session_secret_hash: await sha256(sessionSecret), result_token_hash: await sha256(resultToken) }).select("id").single();
  if (sessionError || !session) { await admin.from("radar_leads").delete().eq("id", lead.id); throw sessionError ?? new Error("Não foi possível abrir a avaliação."); }
  await Promise.all([
    admin.from("utm_attribution").insert({ lead_id: lead.id, utm_source: data.utmSource ?? null, utm_medium: data.utmMedium ?? null, utm_campaign: data.utmCampaign ?? null, utm_content: data.utmContent ?? null, utm_term: data.utmTerm ?? null, referrer: data.referrer ?? null, landing_page: data.landingPage ?? null }),
    admin.from("lead_events").insert([{ lead_id: lead.id, session_id: session.id, event_type: "LEAD_CREATED", source: data.source ?? "radar" }, { lead_id: lead.id, session_id: session.id, event_type: "RADAR_STARTED", source: data.source ?? "radar" }]),
    admin.from("lead_status_history").insert({ lead_id: lead.id, previous_status: null, new_status: "RADAR_STARTED", reason: "Identificação concluída" }),
  ]);
  return { sessionId: session.id, secret: sessionSecret, resultToken };
});

export const resumeRadar = createServerFn({ method: "POST" }).inputValidator((input: unknown) => accessSchema.parse(input)).handler(async ({ data }) => {
  const admin = await adminClient(); const session = await requireSession(admin, data.sessionId, data.secret);
  const [{ data: questions }, { data: answers }] = await Promise.all([
    admin.from("radar_questions").select("id,question_key,pillar,position,prompt,low_label,high_label,reverse_scored").eq("radar_version", session.radar_version).eq("active", true).order("position"),
    admin.from("radar_answers").select("question_id,answer_value").eq("session_id", session.id),
  ]);
  return { questions: questions ?? [], answers: answers ?? [], currentQuestion: session.current_question, completed: Boolean(session.completed_at) };
});

export const saveRadarAnswer = createServerFn({ method: "POST" }).inputValidator((input: unknown) => accessSchema.extend({ questionId: z.string().uuid(), value: z.number().int().min(1).max(5), position: z.number().int().min(1).max(100) }).parse(input)).handler(async ({ data }) => {
  const admin = await adminClient(); const session = await requireSession(admin, data.sessionId, data.secret); if (session.completed_at) return { completed: true };
  const { data: question } = await admin.from("radar_questions").select("id").eq("id", data.questionId).eq("radar_version", session.radar_version).eq("active", true).maybeSingle(); if (!question) throw new Error("Pergunta inválida.");
  await admin.from("radar_answers").upsert({ session_id: session.id, question_id: question.id, answer_value: data.value, answered_at: new Date().toISOString() }, { onConflict: "session_id,question_id" });
  const { count } = await admin.from("radar_answers").select("id", { count: "exact", head: true }).eq("session_id", session.id);
  const { count: total } = await admin.from("radar_questions").select("id", { count: "exact", head: true }).eq("radar_version", session.radar_version).eq("active", true);
  const answered = count ?? 0; const percentage = total ? Math.round(answered / total * 100) : 0; const now = new Date().toISOString();
  await Promise.all([
    admin.from("radar_sessions").update({ current_question: Math.max(session.current_question, data.position), last_activity_at: now }).eq("id", session.id),
    admin.from("radar_leads").update({ operational_status: "RADAR_IN_PROGRESS", questions_answered: answered, completion_percentage: percentage, last_activity_at: now }).eq("id", session.lead_id),
    admin.from("lead_events").insert({ lead_id: session.lead_id, session_id: session.id, event_type: "RADAR_ANSWER_SAVED", metadata: { question_id: question.id, position: data.position, questions_answered: answered } }),
  ]);
  return { questionsAnswered: answered, completionPercentage: percentage };
});

export const finalizeRadar = createServerFn({ method: "POST" }).inputValidator((input: unknown) => accessSchema.parse(input)).handler(async ({ data }) => {
  const admin = await adminClient(); const session = await requireSession(admin, data.sessionId, data.secret);
  const [{ data: questions }, { data: answers }, { data: existingScore }, { data: existingAnalysis }] = await Promise.all([
    admin.from("radar_questions").select("id,question_key,pillar,position,prompt,low_label,high_label,reverse_scored").eq("radar_version", session.radar_version).eq("active", true).order("position"),
    admin.from("radar_answers").select("question_id,answer_value").eq("session_id", session.id), admin.from("radar_scores").select("*").eq("session_id", session.id).maybeSingle(), admin.from("radar_ai_analyses").select("*").eq("session_id", session.id).maybeSingle(),
  ]);
  if (!questions?.length || answers?.length !== questions.length) throw new Error("Responda todas as perguntas antes de concluir.");
  const score = calculateRadarScore(questions as RadarQuestion[], answers);
  if (!existingScore) await admin.from("radar_scores").insert({ session_id: session.id, score_version: session.radar_version, construction_score: score.construction, capacity_score: score.capacity, governance_score: score.governance, perception_score: score.perception, execution_score: score.execution, sim_performance_score: score.total, strongest_pillar: score.strongestPillar, weakest_pillar: score.weakestPillar, raw_answers: Object.fromEntries(answers.map((answer: any) => [answer.question_id, answer.answer_value])), normalized_scores: score.normalized });
  let analysis: RadarAnalysis | null = existingAnalysis?.status === "completed" ? radarAnalysisSchema.safeParse(existingAnalysis).data ?? null : null;
  if (!analysis) {
    const attempts = (existingAnalysis?.attempts ?? 0) + 1;
    const { data: row } = await admin.from("radar_ai_analyses").upsert({ session_id: session.id, status: "processing", model: "openai/gpt-6-astra", model_version: "radar-v1", prompt_version: "1.0", attempts, error_message: null }, { onConflict: "session_id" }).select("id").single();
    await admin.from("radar_leads").update({ operational_status: "ANALYSIS_PROCESSING" }).eq("id", session.lead_id);
    try {
      const { generateRadarAnalysis } = await import("@/lib/radar-analysis.server");
      const generated = await generateRadarAnalysis({ lead: { age: session.radar_leads.age, job_title: session.radar_leads.job_title, company: session.radar_leads.company, segment: session.radar_leads.segment }, questions, answers, score });
      if (!row?.id) throw new Error("Não foi possível preparar a análise.");
      const { data: saved, error } = await admin.from("radar_ai_analyses").update({ ...generated, status: "completed", generated_at: new Date().toISOString() }).eq("id", row.id).select("*").single(); if (error || !saved) throw error ?? new Error("Não foi possível salvar a análise."); analysis = radarAnalysisSchema.parse(saved);
      await admin.from("lead_events").insert({ lead_id: session.lead_id, session_id: session.id, event_type: "RADAR_AI_ANALYZED", metadata: { model: "openai/gpt-6-astra", prompt_version: "1.0" } });
    } catch (error) { const message = error instanceof Error ? error.message : "A análise não pôde ser concluída."; if (row?.id) await admin.from("radar_ai_analyses").update({ status: "failed", error_message: message }).eq("id", row.id); await admin.from("radar_leads").update({ operational_status: "ANALYSIS_FAILED" }).eq("id", session.lead_id); throw new Error(message); }
  }
  if (!analysis) throw new Error("A análise não pôde ser concluída.");
  const now = new Date().toISOString();
  const responseList = questions.map((question: any) => ({ question: question.prompt, answer: answers.find((answer: any) => answer.question_id === question.id)?.answer_value ?? 0, low: question.low_label, high: question.high_label }));
  const snapshot = { lead: { name: session.radar_leads.full_name, company: session.radar_leads.company, job_title: session.radar_leads.job_title }, score, analysis, responses: responseList, radarVersion: session.radar_version, generatedAt: now };
  const { data: report } = await admin.from("radar_reports").upsert({ session_id: session.id, status: "processing", radar_version: session.radar_version, snapshot, attempts: 1 }, { onConflict: "session_id" }).select("id,attempts").single();
  try {
    const { buildRadarPdf } = await import("@/lib/radar-pdf.server"); const bytes = await buildRadarPdf({ name: session.radar_leads.full_name, date: new Intl.DateTimeFormat("pt-BR").format(new Date()), score, analysis, responses: responseList }); const path = `${session.lead_id}/${session.id}.pdf`;
    const { error } = await admin.storage.from("radar-reports").upload(path, bytes, { contentType: "application/pdf", upsert: true }); if (error) throw error;
    if (!report?.id) throw new Error("Não foi possível registrar o relatório.");
    await admin.from("radar_reports").update({ status: "ready", storage_path: path, generated_at: now, error_message: null }).eq("id", report.id);
    await admin.from("lead_events").insert({ lead_id: session.lead_id, session_id: session.id, event_type: "RADAR_PDF_GENERATED" });
  } catch (error) { if (report?.id) await admin.from("radar_reports").update({ status: "failed", error_message: error instanceof Error ? error.message : "Falha ao gerar relatório." }).eq("id", report.id); }
  await Promise.all([
    admin.from("radar_sessions").update({ completed_at: session.completed_at ?? now, current_question: questions.length, last_activity_at: now }).eq("id", session.id),
    admin.from("radar_leads").update({ commercial_status: "RADAR_COMPLETED", operational_status: "RESULT_READY", questions_answered: questions.length, completion_percentage: 100, last_activity_at: now }).eq("id", session.lead_id),
    admin.from("lead_status_history").insert({ lead_id: session.lead_id, previous_status: session.radar_leads.commercial_status, new_status: "RADAR_COMPLETED", reason: "Radar concluído" }),
    admin.from("lead_events").insert([{ lead_id: session.lead_id, session_id: session.id, event_type: "RADAR_COMPLETED" }, { lead_id: session.lead_id, session_id: session.id, event_type: "RADAR_SCORE_CALCULATED", metadata: { score: score.total } }]),
  ]);
  return { resultToken: session.result_token_plain ?? null };
});

export const getRadarResult = createServerFn({ method: "POST" }).inputValidator((input: unknown) => z.object({ token: z.string().min(32).max(200) }).parse(input)).handler(async ({ data }) => {
  const admin = await adminClient(); const hash = await sha256(data.token); const { data: session } = await admin.from("radar_sessions").select("id,lead_id,radar_version,completed_at,radar_leads(full_name,company,job_title,commercial_status)").eq("result_token_hash", hash).maybeSingle(); if (!session?.completed_at) throw new Error("Resultado não encontrado.");
  const [{ data: score }, { data: analysis }, { data: report }, { data: settings }] = await Promise.all([admin.from("radar_scores").select("*").eq("session_id", session.id).single(), admin.from("radar_ai_analyses").select("*").eq("session_id", session.id).single(), admin.from("radar_reports").select("status,storage_path,error_message").eq("session_id", session.id).maybeSingle(), admin.from("radar_settings").select("campaign_active,whatsapp_group_url,cta_text").eq("id", true).single()]);
  let reportUrl: string | null = null; if (report?.status === "ready" && report.storage_path) reportUrl = (await admin.storage.from("radar-reports").createSignedUrl(report.storage_path, 600)).data?.signedUrl ?? null;
  await admin.from("lead_events").insert({ lead_id: session.lead_id, session_id: session.id, event_type: "RADAR_RESULT_VIEWED" });
  return { lead: session.radar_leads, score, analysis, report: { status: report?.status ?? "processing", url: reportUrl, error: report?.error_message ?? null }, settings };
});

export const trackRadarWhatsAppClick = createServerFn({ method: "POST" }).inputValidator((input: unknown) => z.object({ token: z.string().min(32).max(200) }).parse(input)).handler(async ({ data }) => {
  const admin = await adminClient(); const { data: session } = await admin.from("radar_sessions").select("id,lead_id").eq("result_token_hash", await sha256(data.token)).maybeSingle(); if (!session) throw new Error("Resultado não encontrado.");
  const { data: lead } = await admin.from("radar_leads").select("commercial_status,source").eq("id", session.lead_id).single();
  await Promise.all([admin.from("lead_events").insert({ lead_id: session.lead_id, session_id: session.id, event_type: "WHATSAPP_GROUP_CLICKED", source: lead?.source ?? "radar" }), admin.from("radar_leads").update({ commercial_status: "WHATSAPP_CLICKED", last_activity_at: new Date().toISOString() }).eq("id", session.lead_id), admin.from("lead_status_history").insert({ lead_id: session.lead_id, previous_status: lead?.commercial_status ?? null, new_status: "WHATSAPP_CLICKED", reason: "Clicou no grupo privado" })]); return { ok: true };
});

export const getRadarAdminData = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireStaff(context); const admin = await adminClient(); const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [{ data: leads }, { count: visitors }, { data: events }] = await Promise.all([admin.from("radar_leads").select("*,radar_sessions(id,radar_version,completed_at,radar_scores(*),radar_ai_analyses(primary_strength,primary_bottleneck,status),radar_reports(status))").order("created_at", { ascending: false }), admin.from("radar_visits").select("id", { count: "exact", head: true }).gte("visited_at", since), admin.from("lead_events").select("event_type,lead_id").gte("created_at", since)]);
  return { leads: leads ?? [], visitors: visitors ?? 0, events: events ?? [] };
});

export const getRadarLead360 = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ leadId: z.string().uuid() }).parse(input)).handler(async ({ data, context }) => {
  await requireStaff(context); const admin = await adminClient();
  const { data: lead } = await admin.from("radar_leads").select("*,utm_attribution(*),radar_sessions(*,radar_answers(*,radar_questions(*)),radar_scores(*),radar_ai_analyses(*),radar_reports(*))").eq("id", data.leadId).single();
  const [{ data: events }, { data: history }] = await Promise.all([admin.from("lead_events").select("*").eq("lead_id", data.leadId).order("created_at", { ascending: false }), admin.from("lead_status_history").select("*").eq("lead_id", data.leadId).order("created_at", { ascending: false })]); return { lead, events: events ?? [], history: history ?? [] };
});

export const updateRadarLeadStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ leadId: z.string().uuid(), status: z.enum(statuses), reason: z.string().max(500).optional() }).parse(input)).handler(async ({ data, context }) => {
  await requireStaff(context); const admin = await adminClient(); const { data: lead } = await admin.from("radar_leads").select("commercial_status").eq("id", data.leadId).single(); await Promise.all([admin.from("radar_leads").update({ commercial_status: data.status }).eq("id", data.leadId), admin.from("lead_status_history").insert({ lead_id: data.leadId, previous_status: lead?.commercial_status ?? null, new_status: data.status, changed_by: context.userId, reason: data.reason ?? "Alteração administrativa" }), admin.from("lead_events").insert({ lead_id: data.leadId, event_type: "LEAD_STATUS_CHANGED", metadata: { previous: lead?.commercial_status, next: data.status, actor_id: context.userId } })]); return { ok: true };
});

export const getRadarSettingsAdmin = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => { await requireStaff(context); const admin = await adminClient(); return (await admin.from("radar_settings").select("*").eq("id", true).single()).data; });
export const updateRadarSettingsAdmin = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ campaignActive: z.boolean(), whatsappGroupUrl: z.string().url(), videoUrl: z.union([z.string().url(), z.literal("")]), activeVersion: z.string().min(1).max(30), ctaText: z.string().min(3).max(100) }).parse(input)).handler(async ({ data, context }) => { const roles = await requireStaff(context); if (!roles.some((row: { role: string }) => row.role === "admin_master")) throw new Error("Somente Admin Master altera o Radar."); const admin = await adminClient(); const { error } = await admin.from("radar_settings").update({ campaign_active: data.campaignActive, whatsapp_group_url: data.whatsappGroupUrl, video_url: data.videoUrl || null, active_version: data.activeVersion, cta_text: data.ctaText, updated_by: context.userId }).eq("id", true); if (error) throw error; return { ok: true }; });
