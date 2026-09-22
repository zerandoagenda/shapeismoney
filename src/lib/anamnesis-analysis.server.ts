import { Output, NoObjectGeneratedError, streamText } from "ai";
import { z } from "zod";
import { pillarLabels, type PillarKey } from "@/lib/sim-score";

const analysisSchema = z.object({
  summary: z.string(),
  executive_context: z.string(),
  primary_objective: z.string(),
  limiting_factors: z.array(z.string()),
  adherence_factors: z.array(z.string()),
  recovery_factors: z.array(z.string()),
  safety_level: z.enum(["GREEN", "YELLOW", "RED"]),
  safety_notes: z.array(z.string()),
  evidence_used: z.array(z.string()),
  missing_information: z.array(z.string()),
  confidence: z.number(),
  pillar_insights: z.array(z.object({
    pillar: z.enum(["construction", "capacity", "governance", "perception", "execution"]),
    components: z.array(z.string()),
    sources: z.array(z.string()),
    bottleneck: z.string(),
    advance: z.string(),
    next_action: z.string(),
  })),
});

export async function ensureLatestAnamnesisAnalysis(input: { admin: any; clientId: string; actorId: string; force?: boolean }) {
  const { admin, clientId } = input;
  const { data: anamnesis } = await admin.from("client_anamnesis").select("id,version,sections,status").eq("client_id", clientId).eq("status", "completed").order("version", { ascending: false }).limit(1).maybeSingle();
  if (!anamnesis) return null;
  const { data: existing } = await admin.from("anamnesis_analyses").select("*").eq("anamnesis_id", anamnesis.id).maybeSingle();
  if (existing?.status === "completed" && !input.force) return existing;
  const { data: analysisRow, error: rowError } = await admin.from("anamnesis_analyses").upsert({
    client_id: clientId,
    anamnesis_id: anamnesis.id,
    status: "processing",
    model: "openai/gpt-6-astra",
    model_version: "anamnesis-v1",
    attempts: (existing?.attempts ?? 0) + 1,
    started_at: new Date().toISOString(),
    error_message: null,
  }, { onConflict: "anamnesis_id" }).select("id").single();
  if (rowError || !analysisRow) throw rowError ?? new Error("Não foi possível iniciar a leitura da anamnese.");
  const [score, pain, checkins, sessions] = await Promise.all([
    admin.from("sim_scores").select("*").eq("user_id", clientId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("pain_reports").select("classification,status,location,intensity").eq("user_id", clientId).neq("status", "closed"),
    admin.from("daily_checkins").select("sleep_quality,energy,stress,pain,hydration,trained,nutrition_on_track,checkin_date").eq("user_id", clientId).order("checkin_date", { ascending: false }).limit(14),
    admin.from("workout_sessions").select("status,completion_percent,session_rpe,session_pain,started_at").eq("user_id", clientId).order("started_at", { ascending: false }).limit(20),
  ]);
  const redSignal = (pain.data ?? []).some((item: any) => item.classification === "RED");
  try {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) throw new Error("A leitura inteligente não está configurada.");
    const { createLovableResponsesProvider } = await import("@/lib/ai-gateway.server");
    const result = streamText({
      model: createLovableResponsesProvider(key).responses("openai/gpt-6-astra"),
      instructions: "Analise dados autorrelatados de performance executiva sem diagnosticar, inferir doenças ou prescrever medicamentos. Distingua fatos, hipóteses e lacunas. Use somente as evidências fornecidas. Produza recomendações comportamentais e operacionais para revisão humana.",
      prompt: `Analise esta anamnese e seus sinais em português. Contexto: ${JSON.stringify({ anamnesis: anamnesis.sections, sim_score: score.data, open_pain_reports: pain.data ?? [], recent_checkins: checkins.data ?? [], training_history: sessions.data ?? [] })}`,
      output: Output.object({ schema: analysisSchema, name: "anamnesis_analysis" }),
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    const analysis = await result.output;
    const safetyLevel = redSignal ? "RED" : analysis.safety_level;
    const readiness = buildAnamnesisReadiness(anamnesis.sections as Record<string, unknown>, safetyLevel);
    const { data: saved, error } = await admin.from("anamnesis_analyses").update({
      status: "completed", summary: analysis.summary, executive_context: analysis.executive_context,
      primary_objective: analysis.primary_objective, limiting_factors: analysis.limiting_factors,
      adherence_factors: analysis.adherence_factors, recovery_factors: analysis.recovery_factors,
      safety_level: safetyLevel, safety_notes: analysis.safety_notes, evidence_used: analysis.evidence_used,
      missing_information: analysis.missing_information, readiness, confidence: Math.max(0, Math.min(1, analysis.confidence)),
      completed_at: new Date().toISOString(),
    }).eq("id", analysisRow.id).select("*").single();
    if (error || !saved) throw error ?? new Error("Não foi possível salvar a leitura.");
    const scores = (score.data ?? {}) as Record<string, unknown>;
    await admin.from("pillar_insights").upsert(analysis.pillar_insights.map((item) => ({
      client_id: clientId, score_id: score.data?.id ?? null, anamnesis_analysis_id: analysisRow.id,
      pillar: item.pillar, score: Number(scores[item.pillar] ?? 0), components: item.components,
      sources: item.sources, bottleneck: item.bottleneck, advance: item.advance, next_action: item.next_action,
    })), { onConflict: "client_id,score_id,pillar" });
    return saved;
  } catch (error) {
    const message = NoObjectGeneratedError.isInstance(error) ? "A leitura retornou um formato incompleto. Tente novamente." : error instanceof Error ? error.message : "A leitura não pôde ser concluída.";
    await admin.from("anamnesis_analyses").update({ status: "failed", error_message: message, completed_at: new Date().toISOString() }).eq("id", analysisRow.id);
    throw new Error(message);
  }
}

export function buildAnamnesisReadiness(sections: Record<string, unknown>, safetyLevel: string) {
  const required = {
    objective: Boolean(sections['main_goal'] || sections['goal_90_days']),
    training_history: Boolean(sections['training_history']),
    weekly_frequency: Number(sections['sustainable_training_days'] ?? 0) > 0,
    session_duration: Number(sections['session_minutes'] ?? 0) > 0,
    limitations_reviewed: sections['has_discomfort'] !== undefined && sections['has_discomfort'] !== "",
  };
  const missing = Object.entries(required).filter(([, value]) => !value).map(([key]) => key);
  return { ...required, safety_level: safetyLevel, ready: missing.length === 0 && safetyLevel !== "RED", missing };
}

export const pillarKeys = Object.keys(pillarLabels) as PillarKey[];