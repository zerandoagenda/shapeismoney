import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Output, streamText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({ scanId: z.string().uuid() });
const findingSchema = z.object({ category: z.enum(["posture_presence", "clothing_fit", "body_language", "context", "coherence"]), type: z.enum(["strength", "friction", "layer"]), title: z.string(), description: z.string(), impact: z.string(), recommendation: z.string() });
const actionSchema = z.object({ day_number: z.number(), title: z.string(), instruction: z.string() });
const reportSchema = z.object({ coherence_score: z.number(), posture_score: z.number(), presence_score: z.number(), appearance_score: z.number(), body_language_score: z.number(), context_score: z.number(), summary: z.string(), priority: z.string(), next_action: z.string(), findings: z.array(findingSchema), actions: z.array(actionSchema) });

const instructions = `Você é o Perception Agent do Shape Is Money. Analise somente sinais VISÍVEIS e produza uma leitura de COERÊNCIA, nunca de beleza. Use o mapa: BIOLOGIA → CORPO → SIGNIFICADO → LINGUAGEM CORPORAL → APARÊNCIA → COMPORTAMENTO → AMBIENTE → NARRATIVA → COERÊNCIA → REPUTAÇÃO → VALOR PERCEBIDO. Pergunta: os sinais visíveis contam a mesma história que a pessoa deseja comunicar?
Você pode observar posição aparente dos ombros, abertura e inclinação corporal, ocupação de espaço, cabeça, base e apoio, gestos visíveis, contato visual quando possível, caimento e proporção visual das roupas, contraste, formalidade, organização visual e coerência com o contexto.
Nunca diagnostique doenças ou desvios médicos; nunca infira personalidade, inteligência, riqueza, competência, sexualidade, religião ou política; nunca avalie atratividade; nunca humilhe; nunca use linguagem determinística. Escreva sempre como percepção possível: “pode transmitir”, “neste registro”, “neste contexto”. Scores são índices internos de coerência visual, de 0 a 100.
Retorne exatamente 11 findings: 3 strength, 3 friction e 5 layer (uma por categoria). Retorne exatamente 7 actions, day_number de 1 a 7, simples e observáveis. Todo campo deve ser preenchido.`;

function safeMessage(error: unknown) {
  const value = error instanceof Error ? error.message : "A análise não pôde ser concluída.";
  return value.length > 300 ? value.slice(0, 300) : value;
}

export const analyzePerceptionScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const [{ data: scan }, { data: profile }] = await Promise.all([
      context.supabase.from("perception_scans").select("*").eq("id", data.scanId).eq("user_id", context.userId).single(),
      context.supabase.from("profiles").select("plan").eq("id", context.userId).single(),
    ]);
    if (!profile) throw new Error("Perfil não encontrado.");
    const [{ data: entitlement }, { data: roles }] = await Promise.all([context.supabase.from("plan_entitlements").select("enabled").eq("feature_key", "can_access_perception_lab").eq("plan", profile.plan).maybeSingle(), context.supabase.from("user_roles").select("role").eq("user_id", context.userId)]);
    const betaAccess=(roles??[]).some(item=>item.role==="beta_member"||item.role==="admin_master");
    if (!scan || (entitlement?.enabled !== true && !betaAccess)) throw new Error("O Perception Lab não está liberado para esta conta.");
    const { data: imageRows } = await context.supabase.from("perception_scan_images").select("*").eq("scan_id", scan.id).order("created_at");
    if (!imageRows || !imageRows.some((item) => item.image_type === "front") || !imageRows.some((item) => item.image_type === "profile") || !imageRows.some((item) => item.image_type === "back")) throw new Error("Envie as fotos de frente, perfil e costas antes da análise.");
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) throw new Error("O Perception Engine não está configurado.");
    try {
      const content: Array<{ type: "text"; text: string } | { type: "image"; image: Uint8Array; mediaType: string }> = [{ type: "text", text: `Contexto declarado: ${scan.context}. Sinais desejados: ${scan.desired_signals.join(", ")}. Analise o conjunto de imagens como registros complementares da mesma pessoa.` }];
      for (const row of imageRows) { const { data: blob, error } = await context.supabase.storage.from("perception-scans").download(row.storage_path); if (error) throw error; content.push({ type: "image", image: new Uint8Array(await blob.arrayBuffer()), mediaType: row.mime_type }); }
      const [{ createPerceptionModel }, { supabaseAdmin }] = await Promise.all([
        import("@/lib/ai-gateway.server"),
        import("@/integrations/supabase/client.server"),
      ]);
      const result = streamText({ model: createPerceptionModel(key), instructions, messages: [{ role: "user", content }], output: Output.object({ schema: reportSchema, name: "perception_report" }), providerOptions: { openai: { forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } } });
      const report = reportSchema.parse(JSON.parse(await result.text));
      await supabaseAdmin.from("perception_findings").delete().eq("scan_id", scan.id);
      await supabaseAdmin.from("perception_actions").delete().eq("scan_id", scan.id);
      const { error: findingsError } = await supabaseAdmin.from("perception_findings").insert(report.findings.map((item, index) => ({ ...item, scan_id: scan.id, sort_order: index })));
      if (findingsError) throw findingsError;
      const { error: actionsError } = await supabaseAdmin.from("perception_actions").insert(report.actions.map((item) => ({ ...item, scan_id: scan.id })));
      if (actionsError) throw actionsError;
      const { error: scanError } = await supabaseAdmin.from("perception_scans").update({ status: "ai_completed", provider: "Lovable AI", model: "openai/gpt-6-astra", coherence_score: Math.round(report.coherence_score), posture_score: Math.round(report.posture_score), presence_score: Math.round(report.presence_score), appearance_score: Math.round(report.appearance_score), body_language_score: Math.round(report.body_language_score), context_score: Math.round(report.context_score), summary: report.summary, priority: report.priority, next_action: report.next_action, error_message: null }).eq("id", scan.id);
      if (scanError) throw scanError;
      await supabaseAdmin.from("crm_events").insert({ user_id: context.userId, event_type: "perception.scan.completed", metadata: { scan_id: scan.id } });
      return { ok: true };
    } catch (error) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("perception_findings").delete().eq("scan_id", scan.id);
      await supabaseAdmin.from("perception_actions").delete().eq("scan_id", scan.id);
      await supabaseAdmin.from("perception_scans").update({ status: "failed", error_message: safeMessage(error) }).eq("id", scan.id);
      throw error;
    }
  });