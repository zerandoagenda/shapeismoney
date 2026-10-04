export type PerformanceSignal = {
  energy: number | null;
  sleep: number | null;
  stress: number | null;
  pain: number | null;
  adherence: number | null;
};

export type PerformanceReading = {
  label: "Em evolução" | "Estável" | "Precisa de atenção" | "Em calibração";
  tone: "positive" | "neutral" | "attention";
  summary: string;
  strengths: string[];
  attention: string[];
};

export function average(values: Array<number | null | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number");
  return valid.length ? valid.reduce((total, value) => total + value, 0) / valid.length : null;
}

export function adherencePercent(completed: number, planned: number) {
  return planned > 0 ? Math.round((completed / planned) * 100) : null;
}

export function readPerformance(signal: PerformanceSignal): PerformanceReading {
  const strengths = [
    signal.adherence !== null && signal.adherence >= 80 ? "Boa consistência nos treinos" : null,
    signal.energy !== null && signal.energy >= 4 ? "Energia em bom nível" : null,
    signal.sleep !== null && signal.sleep >= 4 ? "Sono favorecendo a recuperação" : null,
    signal.stress !== null && signal.stress <= 2 ? "Estresse sob controle" : null,
    signal.pain !== null && signal.pain <= 2 ? "Dor sem sinal relevante" : null,
  ].filter((value): value is string => Boolean(value));

  const attention = [
    signal.adherence !== null && signal.adherence < 70 ? `Adesão abaixo do esperado (${signal.adherence}%)` : null,
    signal.energy !== null && signal.energy <= 2 ? "Energia baixa" : null,
    signal.sleep !== null && signal.sleep <= 2 ? "Sono abaixo do necessário" : null,
    signal.stress !== null && signal.stress >= 4 ? "Estresse elevado" : null,
    signal.pain !== null && signal.pain >= 4 ? `Dor elevada (${signal.pain}/10)` : null,
  ].filter((value): value is string => Boolean(value));

  const hasData = Object.values(signal).some((value) => value !== null);
  if (!hasData) return { label: "Em calibração", tone: "neutral", summary: "Registre sua semana para formar uma leitura confiável.", strengths, attention };
  if (attention.length) return { label: "Precisa de atenção", tone: "attention", summary: attention[0] ?? "Há um sinal que merece atenção nesta semana.", strengths, attention };
  if (strengths.length >= 2) return { label: "Em evolução", tone: "positive", summary: strengths[0] ?? "Os sinais da semana estão evoluindo.", strengths, attention };
  return { label: "Estável", tone: "neutral", summary: "Os registros estão estáveis; continue acumulando evidências.", strengths, attention };
}

export function changeFromFirst(values: number[]) {
  if (values.length < 2) return null;
  const first = values[0];
  const last = values.at(-1);
  if (first === undefined || last === undefined) return null;
  return last - first;
}