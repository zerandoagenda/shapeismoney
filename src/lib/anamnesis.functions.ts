import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calculateSimScore, type ScoreAnswers } from "@/lib/sim-score";

const answersSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

async function requireOperator(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
  if (!data?.some((row: { role: string }) => ["coach", "manager", "admin", "admin_master", "nutritionist", "nutrition", "specialist"].includes(row.role))) throw new Error("Acesso restrito à equipe operacional.");
}

export const completeClientAnamnesis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ answers: answersSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { trustedAdmin } = await import("@/lib/trusted-admin.server");
    const { data: latest } = await trustedAdmin.from("client_anamnesis").select("id,version,status,sections").eq("client_id", context.userId).order("version", { ascending: false }).limit(1).maybeSingle();
    if (latest?.status === "completed" && JSON.stringify(latest.sections) === JSON.stringify(data.answers)) {
      const { processClientActivation } = await import("@/lib/sim-orchestrator.server");
      await processClientActivation({ admin: trustedAdmin, clientId: context.userId, event: "anamnesis.completed", actorId: context.userId });
      return { ok: true, anamnesisId: latest.id, analysisStatus: "completed" };
    }
    const sameDraft = latest?.status === "draft";
    const version = sameDraft ? latest.version : (latest?.version ?? 0) + 1;
    if (latest?.status === "completed") await trustedAdmin.from("client_anamnesis").update({ status: "superseded" }).eq("id", latest.id);
    const values = { client_id: context.userId, version, status: "completed", sections: data.answers, source: "member", created_by: context.userId, completed_at: new Date().toISOString() };
    const query = sameDraft ? trustedAdmin.from("client_anamnesis").update(values).eq("id", latest.id) : trustedAdmin.from("client_anamnesis").insert(values);
    const { data: anamnesis, error } = await query.select("id").single();
    if (error || !anamnesis) throw error ?? new Error("Não foi possível concluir a anamnese.");
    const score = calculateSimScore(data.answers as ScoreAnswers);
    const { data: scoreRow, error: scoreError } = await trustedAdmin.from("sim_scores").insert({ user_id: context.userId, ...score, source: `anamnesis_v${version}` }).select("id").single();
    if (scoreError) throw scoreError;
    const profileData = { first_name: String(data.answers['first_name'] ?? ""), birth_date: String(data.answers['birth_date'] || "") || null, height_cm: Number(data.answers['height_cm']) || null, weight_kg: Number(data.answers['weight_kg']) || null, profession: String(data.answers['profession'] || "") || null, company: String(data.answers['company'] || "") || null, job_title: String(data.answers['job_title'] || "") || null, onboarding_completed_at: new Date().toISOString() };
    await trustedAdmin.from("profiles").update(profileData).eq("id", context.userId);
    await trustedAdmin.from("crm_events").insert([{ user_id: context.userId, event_type: "anamnesis.completed", metadata: { anamnesis_id: anamnesis.id, version } }, { user_id: context.userId, event_type: "baseline.completed", metadata: { score_id: scoreRow?.id, score: score.total } }]);
    const { ensureLatestAnamnesisAnalysis } = await import("@/lib/anamnesis-analysis.server");
    let analysisStatus = "completed";
    try { await ensureLatestAnamnesisAnalysis({ admin: trustedAdmin, clientId: context.userId, actorId: context.userId }); }
    catch { analysisStatus = "failed"; }
    const { processClientActivation } = await import("@/lib/sim-orchestrator.server");
    await processClientActivation({ admin: trustedAdmin, clientId: context.userId, event: "anamnesis.completed", actorId: context.userId });
    return { ok: true, anamnesisId: anamnesis.id, analysisStatus };
  });

export const getTrainingEvidenceSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ clientId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOperator(context);
    const { trustedAdmin } = await import("@/lib/trusted-admin.server");
    const { buildTrainingEvidenceBundle } = await import("@/lib/training-architect.server");
    const bundle = await buildTrainingEvidenceBundle({ admin: trustedAdmin, clientId: data.clientId });
    return {
      profile: bundle.profile, anamnesis: bundle.anamnesis, analysis: bundle.analysis, simScore: bundle.sim_score,
      cycle: bundle.cycle, assessment: bundle.assessment, photoProtocol: bundle.photo_protocol,
      perception: bundle.perception, safety: bundle.safety, readiness: bundle.readiness,
      recentCheckins: bundle.recent_checkins.length, weeklyReviews: bundle.weekly_reviews.length,
      trainingSessions: bundle.training_history.length, habits: bundle.habits,
      exerciseLibraryCount: bundle.exercise_library.length,
    };
  });

export const retryAnamnesisAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ clientId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireOperator(context);
    const { trustedAdmin } = await import("@/lib/trusted-admin.server");
    const { ensureLatestAnamnesisAnalysis } = await import("@/lib/anamnesis-analysis.server");
    return ensureLatestAnamnesisAnalysis({ admin: trustedAdmin, clientId: data.clientId, actorId: context.userId, force: true });
  });