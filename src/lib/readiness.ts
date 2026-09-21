export type ReadinessInput = {
  registered: boolean;
  fullAccess: boolean;
  onboarding: boolean;
  baseline: boolean;
  photoCount: number;
  assessmentReviewed: boolean;
  protocolPublished: boolean;
  trainingPublished: boolean;
  nutritionPublished: boolean;
  perceptionComplete: boolean;
  firstCheckin: boolean;
  firstWorkout: boolean;
};

export function buildReadiness(input: ReadinessInput) {
  return [
    ["Cadastro", input.registered],
    ["Beta/Premium access", input.fullAccess],
    ["Onboarding", input.onboarding],
    ["SIM Baseline", input.baseline],
    ["Protocolo fotográfico 17/17", input.photoCount >= 17],
    ["Assessment revisado", input.assessmentReviewed],
    ["Protocolo executivo", input.protocolPublished],
    ["Treino publicado", input.trainingPublished],
    ["Nutrição publicada", input.nutritionPublished],
    ["Perception Scan", input.perceptionComplete],
    ["Primeiro check-in", input.firstCheckin],
    ["Primeiro treino", input.firstWorkout],
  ] as const;
}