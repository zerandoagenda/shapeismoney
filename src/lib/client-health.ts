export type HealthSignals = {
  lastActivityAt: string | null;
  checkins30d: number;
  workouts30d: number;
  nutritionPublished: boolean;
  protocolPublished: boolean;
  memberViews30d: number;
  perceptionActivity30d: number;
};

export type ClientHealth = { score: number; label: "HEALTHY" | "ATTENTION" | "AT RISK"; reasons: string[] };

export function calculateClientHealth(signals: HealthSignals): ClientHealth {
  const reasons: string[] = [];
  let score = 0;
  const daysSinceActivity = signals.lastActivityAt ? Math.floor((Date.now() - new Date(signals.lastActivityAt).getTime()) / 86400000) : null;
  if (daysSinceActivity !== null && daysSinceActivity <= 7) score += 25; else reasons.push("Sem atividade recente");
  if (signals.checkins30d >= 8) score += 20; else if (signals.checkins30d >= 3) score += 10; else reasons.push("Baixa frequência de check-ins");
  if (signals.workouts30d >= 8) score += 20; else if (signals.workouts30d >= 3) score += 10; else reasons.push("Baixa execução de treinos");
  if (signals.protocolPublished) score += 15; else reasons.push("Protocolo não publicado");
  if (signals.nutritionPublished) score += 10;
  if (signals.memberViews30d > 0) score += 5;
  if (signals.perceptionActivity30d > 0) score += 5;
  return { score, label: score >= 70 ? "HEALTHY" : score >= 40 ? "ATTENTION" : "AT RISK", reasons };
}

export function businessHoursSince(value: string) {
  const start = new Date(value); const end = new Date(); let hours = 0; const cursor = new Date(start);
  while (cursor < end) { cursor.setHours(cursor.getHours() + 1); const day = cursor.getDay(); if (day !== 0 && day !== 6) hours += 1; }
  return hours;
}

export function slaState(hours: number) { return hours > 72 ? "OVERDUE" : hours >= 56 ? "SLA RISK" : "ON TRACK"; }