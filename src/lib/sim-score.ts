export const pillarLabels = {
  construction: "Construção",
  capacity: "Capacidade",
  governance: "Governo",
  perception: "Percepção",
  execution: "Execução",
} as const;

export type PillarKey = keyof typeof pillarLabels;
export type ScoreAnswers = Record<`${PillarKey}_${1 | 2 | 3}`, number>;

export type SimScoreResult = Record<PillarKey, number> & {
  total: number;
  strongest_pillar: string;
  bottleneck: string;
  priority: string;
  recommendation: string;
  coherence_level: string;
};

const guidance: Record<PillarKey, { priority: string; recommendation: string }> = {
  construction: { priority: "Reconstruir a base física.", recommendation: "Defina uma frequência mínima de treino e acompanhe sua evolução antes de aumentar a complexidade." },
  capacity: { priority: "Recuperar capacidade e energia.", recommendation: "Proteja sono, recuperação e manejo de desconfortos para sustentar sua rotina com mais energia." },
  governance: { priority: "Recuperar governo da rotina.", recommendation: "Estabeleça horários mínimos de sono, treino e alimentação antes de aumentar a complexidade." },
  perception: { priority: "Alinhar presença e percepção.", recommendation: "Trabalhe postura, confiança e coerência entre sua imagem atual e o nível profissional que você ocupa." },
  execution: { priority: "Transformar intenção em evidência.", recommendation: "Reduza o plano ao mínimo sustentável e registre cada compromisso concluído durante os próximos sete dias." },
};

export function normalizeAnswer(value: number, reverse = false) {
  const bounded = Math.max(1, Math.min(5, value));
  return Math.round(((reverse ? 6 - bounded : bounded) - 1) * 25);
}

export function calculateSimScore(answers: ScoreAnswers): SimScoreResult {
  const pillars = (Object.keys(pillarLabels) as PillarKey[]).reduce<Record<PillarKey, number>>((result, pillar) => {
    const values = [1, 2, 3].map((index) => normalizeAnswer(answers[`${pillar}_${index as 1 | 2 | 3}`], pillar === "capacity" && index === 3));
    result[pillar] = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    return result;
  }, { construction: 0, capacity: 0, governance: 0, perception: 0, execution: 0 });
  const entries = Object.entries(pillars) as [PillarKey, number][];
  const strongest = entries.reduce((best, entry) => entry[1] > best[1] ? entry : best, entries[0]);
  const weakest = entries.reduce((worst, entry) => entry[1] < worst[1] ? entry : worst, entries[0]);
  const total = Math.round(entries.reduce((sum, entry) => sum + entry[1], 0) / entries.length);
  return {
    ...pillars,
    total,
    strongest_pillar: pillarLabels[strongest[0]],
    bottleneck: pillarLabels[weakest[0]],
    priority: guidance[weakest[0]].priority,
    recommendation: guidance[weakest[0]].recommendation,
    coherence_level: total >= 80 ? "Consolidada" : total >= 60 ? "Em construção" : "Base a reconstruir",
  };
}