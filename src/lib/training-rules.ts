export type ProgressionInput = {
  allSetsReachRepTarget: boolean;
  techniqueOk: boolean;
  effortWithinTarget: boolean;
  relevantPain: boolean;
};

export function progressionDecision(input: ProgressionInput) {
  return input.allSetsReachRepTarget && input.techniqueOk && input.effortWithinTarget && !input.relevantPain
    ? "SUGGEST_LOAD_PROGRESSION"
    : "MAINTAIN_OR_ADJUST";
}

export type AttentionSignals = {
  pain: number;
  sleepQuality: number;
  energy: number;
  stress: number;
  completionRate: number;
  repeatedMisses: number;
};

export function classifyAttention(signals: AttentionSignals): "RED" | "YELLOW" | "GREEN" {
  if (signals.pain >= 8 || signals.repeatedMisses >= 3 || signals.completionRate < 30) return "RED";
  if (signals.pain >= 5 || signals.sleepQuality <= 2 || signals.energy <= 2 || signals.stress >= 4 || signals.completionRate < 70) return "YELLOW";
  return "GREEN";
}

export function classifyPain(intensity: number, associatedSymptoms: string, radiation: string): "RED" | "YELLOW" | "GREEN" {
  if (intensity >= 8 || associatedSymptoms.trim() || radiation.trim()) return "RED";
  if (intensity >= 4) return "YELLOW";
  return "GREEN";
}