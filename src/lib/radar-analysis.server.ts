import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";
import { pillarLabels, type PillarKey } from "@/lib/sim-score";

export const radarAnalysisSchema = z.object({
  executive_summary: z.string(),
  current_state: z.string(),
  primary_strength: z.object({ pillar: z.enum(["construction", "capacity", "governance", "perception", "execution"]), title: z.string(), explanation: z.string() }),
  primary_bottleneck: z.object({ pillar: z.enum(["construction", "capacity", "governance", "perception", "execution"]), title: z.string(), explanation: z.string() }),
  main_incoherence: z.string(),
  construction_analysis: z.string(),
  capacity_analysis: z.string(),
  governance_analysis: z.string(),
  perception_analysis: z.string(),
  execution_analysis: z.string(),
  priority: z.string(),
  next_movement: z.string(),
  closing_statement: z.string(),
});

export type RadarAnalysis = z.infer<typeof radarAnalysisSchema>;

function fallbackAnalysis(score: Record<PillarKey, number> & { total: number; strongestPillar: PillarKey; weakestPillar: PillarKey }): RadarAnalysis {
  const strong = pillarLabels[score.strongestPillar];
  const weak = pillarLabels[score.weakestPillar];
  return {
    executive_summary: `Seu Radar registra uma performance geral de ${score.total}/100. A distribuição atual mostra ${strong} como principal ativo e ${weak} como o ponto que mais limita a coerência do conjunto.`,
    current_state: score.total >= 80 ? "Performance consolidada, com espaço para refinamento." : score.total >= 60 ? "Performance em construção, com assimetrias claras entre os pilares." : "A base de performance precisa ser reorganizada antes de ganhar complexidade.",
    primary_strength: { pillar: score.strongestPillar, title: strong, explanation: `É o pilar com maior evidência no conjunto de respostas, com ${score[score.strongestPillar]}/100.` },
    primary_bottleneck: { pillar: score.weakestPillar, title: weak, explanation: `É o pilar com menor sustentação no momento, com ${score[score.weakestPillar]}/100.` },
    main_incoherence: `A diferença entre ${strong} e ${weak} indica que sua performance não está distribuída de forma uniforme.`,
    construction_analysis: `Construção registra ${score.construction}/100.`, capacity_analysis: `Capacidade registra ${score.capacity}/100.`, governance_analysis: `Governo registra ${score.governance}/100.`, perception_analysis: `Percepção registra ${score.perception}/100.`, execution_analysis: `Execução registra ${score.execution}/100.`,
    priority: `Elevar ${weak} sem perder a consistência já demonstrada em ${strong}.`,
    next_movement: `Escolha uma ação mensurável ligada a ${weak} e sustente-a pelos próximos sete dias.`,
    closing_statement: "O Radar não é um diagnóstico médico. É uma leitura estruturada das evidências que você forneceu.",
  };
}

export async function generateRadarAnalysis(input: { lead: Record<string, unknown>; questions: Array<Record<string, unknown>>; answers: Array<Record<string, unknown>>; score: Record<PillarKey, number> & { total: number; strongestPillar: PillarKey; weakestPillar: PillarKey } }) {
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) return fallbackAnalysis(input.score);
  try {
    const { createLovableResponsesProvider } = await import("@/lib/ai-gateway.server");
    const result = streamText({
      model: createLovableResponsesProvider(key).responses("openai/gpt-6-astra"),
      instructions: "Produza uma leitura executiva precisa, individual, direta e sofisticada em português brasileiro. O score já foi calculado deterministicamente: nunca o altere. Use somente as respostas fornecidas. Não diagnostique, não prometa resultado financeiro, não afirme causalidade e não use frases motivacionais genéricas. Diferencie evidência de interpretação.",
      prompt: `Interprete este Radar da Performance: ${JSON.stringify(input)}`,
      output: Output.object({ schema: radarAnalysisSchema, name: "radar_performance_analysis" }),
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    return await result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) throw new Error("A análise retornou um formato incompleto.");
    throw error;
  }
}
