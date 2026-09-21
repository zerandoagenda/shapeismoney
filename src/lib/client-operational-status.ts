export type ActivationStage =
  | "PAYMENT_CONFIRMED" | "ONBOARDING_REQUIRED" | "BASELINE_REQUIRED"
  | "PHOTO_PROTOCOL_REQUIRED" | "ASSESSMENT_PROCESSING" | "ASSESSMENT_REVIEW"
  | "CYCLE_STRATEGY" | "TRAINING_GENERATION" | "TRAINING_REVIEW"
  | "NUTRITION_BUILD" | "FINAL_REVIEW" | "READY_TO_PUBLISH" | "ACTIVE_PROTOCOL";

export type TrainingJobStatus =
  | "WAITING_PREREQUISITES" | "READY" | "GENERATING" | "DRAFT_READY"
  | "HUMAN_REVIEW" | "APPROVED" | "PUBLISHED" | "FAILED";

export type ExperienceMode = "FREE_DISCOVERY" | "PAID_ACTIVATION" | "PAID_ACTIVE" | "PLUS_ACTIVE" | "PREMIUM_CONCIERGE";

export type OperationalActivation = {
  current_stage: ActivationStage;
  status: "ACTIVE" | "BLOCKED" | "READY" | "COMPLETED" | "CANCELLED";
  next_action: string;
  next_action_owner: "CLIENT" | "BRUNO" | "TEAM" | "SYSTEM";
  target_delivery_at: string;
  stage_started_at: string;
};

export type ClientOperationalStatus = {
  activationStage: ActivationStage | null;
  activationStatus: OperationalActivation["status"] | null;
  trainingStatus: TrainingJobStatus | null;
  nutritionStatus: string;
  perceptionStatus: string;
  nextAction: string;
  nextActionOwner: string;
  nextRoute: string | null;
  sla: "ON TRACK" | "AT RISK" | "OVERDUE" | "COMPLETE" | "NOT STARTED";
  responsible: string;
};

export const activationStages: Array<{ key: ActivationStage; short: string; label: string }> = [
  { key: "PAYMENT_CONFIRMED", short: "01", label: "Acesso confirmado" },
  { key: "ONBOARDING_REQUIRED", short: "02", label: "Calibração" },
  { key: "PHOTO_PROTOCOL_REQUIRED", short: "03", label: "Protocolo visual" },
  { key: "ASSESSMENT_REVIEW", short: "04", label: "Avaliação" },
  { key: "CYCLE_STRATEGY", short: "05", label: "Estratégia" },
  { key: "TRAINING_GENERATION", short: "06", label: "Treinamento" },
  { key: "NUTRITION_BUILD", short: "07", label: "Nutrição" },
  { key: "FINAL_REVIEW", short: "08", label: "Revisão" },
  { key: "ACTIVE_PROTOCOL", short: "09", label: "Protocolo liberado" },
];

const stageOrder: ActivationStage[] = [
  "PAYMENT_CONFIRMED", "ONBOARDING_REQUIRED", "BASELINE_REQUIRED", "PHOTO_PROTOCOL_REQUIRED",
  "ASSESSMENT_PROCESSING", "ASSESSMENT_REVIEW", "CYCLE_STRATEGY", "TRAINING_GENERATION",
  "TRAINING_REVIEW", "NUTRITION_BUILD", "FINAL_REVIEW", "READY_TO_PUBLISH", "ACTIVE_PROTOCOL",
];

export function experienceMode(plan: string, activation: OperationalActivation | null): ExperienceMode {
  if (plan === "free") return "FREE_DISCOVERY";
  if (activation?.current_stage !== "ACTIVE_PROTOCOL" || activation.status !== "COMPLETED") return "PAID_ACTIVATION";
  if (plan === "premium") return "PREMIUM_CONCIERGE";
  if (plan === "plus") return "PLUS_ACTIVE";
  return "PAID_ACTIVE";
}

export function stageProgress(stage: ActivationStage | null) {
  if (!stage) return 0;
  const index = stageOrder.indexOf(stage);
  return index < 0 ? 0 : index;
}

export function deriveOperationalStatus(input: {
  activation: OperationalActivation | null;
  trainingStatus?: TrainingJobStatus | null;
  nutritionStatus?: string | null;
  perceptionStatus?: string | null;
  responsible?: string | null;
}): ClientOperationalStatus {
  const { activation } = input;
  const target = activation ? new Date(activation.target_delivery_at).getTime() : null;
  const remaining = target === null ? null : target - Date.now();
  const sla = activation?.status === "COMPLETED" ? "COMPLETE" : remaining === null ? "NOT STARTED" : remaining < 0 ? "OVERDUE" : remaining < 24 * 60 * 60 * 1000 ? "AT RISK" : "ON TRACK";
  const routeByStage: Partial<Record<ActivationStage, string>> = {
    ONBOARDING_REQUIRED: "/onboarding", BASELINE_REQUIRED: "/diagnosis",
    PHOTO_PROTOCOL_REQUIRED: "/training/assessment", ACTIVE_PROTOCOL: "/training",
  };
  return {
    activationStage: activation?.current_stage ?? null,
    activationStatus: activation?.status ?? null,
    trainingStatus: input.trainingStatus ?? null,
    nutritionStatus: input.nutritionStatus ?? "NOT_STARTED",
    perceptionStatus: input.perceptionStatus ?? "NOT_STARTED",
    nextAction: activation?.next_action ?? "Complete seu diagnóstico inicial",
    nextActionOwner: activation?.next_action_owner ?? "CLIENT",
    nextRoute: activation ? routeByStage[activation.current_stage] ?? null : "/onboarding",
    sla,
    responsible: input.responsible ?? (activation?.next_action_owner === "BRUNO" ? "Bruno" : activation?.next_action_owner ?? "Cliente"),
  };
}
