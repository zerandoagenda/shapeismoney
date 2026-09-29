import { normalizeAnswer, pillarLabels, type PillarKey } from "@/lib/sim-score";

export type RadarQuestion = { id: string; question_key: string; pillar: PillarKey; position: number; prompt: string; low_label: string; high_label: string; reverse_scored: boolean };
export type RadarAnswer = { question_id: string; answer_value: number };
export type RadarScore = Record<PillarKey, number> & { total: number; strongestPillar: PillarKey; weakestPillar: PillarKey; normalized: Record<string, number> };

export function calculateRadarScore(questions: RadarQuestion[], answers: RadarAnswer[]): RadarScore {
  const answerMap = new Map(answers.map((answer) => [answer.question_id, answer.answer_value]));
  const normalized: Record<string, number> = {};
  const values = Object.keys(pillarLabels).reduce<Record<PillarKey, number[]>>((result, key) => {
    result[key as PillarKey] = [];
    return result;
  }, { construction: [], capacity: [], governance: [], perception: [], execution: [] });
  for (const question of questions) {
    const value = answerMap.get(question.id);
    if (value === undefined) throw new Error("O Radar ainda possui respostas pendentes.");
    const score = normalizeAnswer(value, question.reverse_scored);
    normalized[question.question_key] = score;
    values[question.pillar].push(score);
  }
  const pillars = Object.keys(values).reduce<Record<PillarKey, number>>((result, key) => {
    const pillar = key as PillarKey;
    const list = values[pillar];
    result[pillar] = list.length ? Math.round(list.reduce((sum, value) => sum + value, 0) / list.length) : 0;
    return result;
  }, { construction: 0, capacity: 0, governance: 0, perception: 0, execution: 0 });
  const entries = Object.entries(pillars) as [PillarKey, number][];
  const strongestPillar = entries.reduce((best, entry) => entry[1] > best[1] ? entry : best)[0];
  const weakestPillar = entries.reduce((worst, entry) => entry[1] < worst[1] ? entry : worst)[0];
  return { ...pillars, total: Math.round(entries.reduce((sum, [, value]) => sum + value, 0) / entries.length), strongestPillar, weakestPillar, normalized };
}
