import type { Tables } from "@/integrations/supabase/types";

type BriefInput = {
  checkins: Tables<"daily_checkins">[];
  sessions: Tables<"workout_sessions">[];
  latestScan?: Tables<"perception_scans"> | null;
  hasNutrition?: boolean;
};

export type DailyBrief = { message: string; evidence: string[]; priority: string };

function average(values: Array<number | null>) {
  const present = values.filter((value): value is number => value !== null);
  return present.length ? present.reduce((sum, value) => sum + value, 0) / present.length : null;
}

export function buildDailyBrief({ checkins, sessions, latestScan, hasNutrition }: BriefInput): DailyBrief {
  const recent = checkins.slice(-7);
  const sleep = average(recent.map((item) => item.sleep_quality));
  const energy = recent.map((item) => item.energy).filter((value): value is number => value !== null);
  const completed = sessions.filter((item) => item.completed_at);
  const adherence = completed.length
    ? average(completed.map((item) => item.completion_percent === null ? null : item.completion_percent / 20))
    : null;
  const evidence: string[] = [];

  if (sleep !== null) evidence.push(`Sono médio ${sleep.toFixed(1)} de 5 nos últimos registros`);
  if (energy.length) evidence.push(`${energy.length} registros recentes de energia`);
  if (completed.length) evidence.push(`${completed.length} sessões concluídas no período analisado`);
  if (latestScan?.coherence_score !== null && latestScan?.coherence_score !== undefined) evidence.push(`Coerência visual ${latestScan.coherence_score} de 100`);
  if (hasNutrition) evidence.push("Orientação nutricional publicada pela equipe");

  if (sleep !== null && sleep <= 2) return { message: "Sua execução exige recuperação. Hoje, sua prioridade não é fazer mais. É recuperar capacidade.", evidence, priority: "Recuperação" };
  if (energy.length >= 3 && (energy.at(-1) ?? 0) < (energy[0] ?? 0)) return { message: "Sua energia apresentou queda nos últimos registros. Preserve a execução essencial e reduza ruído na agenda.", evidence, priority: "Energia" };
  if (adherence !== null && adherence >= 4.25) return { message: "Sua execução permanece consistente. Sustente o ritmo sem aumentar complexidade desnecessária.", evidence, priority: "Continuidade" };
  if (latestScan?.status === "ai_completed" && latestScan.priority) return { message: `Seu Perception Scan definiu uma prioridade observável: ${latestScan.priority}`, evidence, priority: "Coerência visual" };
  return { message: "Continue registrando sua rotina para liberar análises mais precisas.", evidence, priority: "Construir evidência" };
}