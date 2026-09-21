import { describe, expect, it, vi } from "vitest";
import { deriveOperationalStatus, experienceMode, stageProgress, type OperationalActivation } from "./client-operational-status";

const activation=(overrides:Partial<OperationalActivation>={}):OperationalActivation=>({current_stage:"ONBOARDING_REQUIRED",status:"BLOCKED",next_action:"Complete sua calibração inicial",next_action_owner:"CLIENT",target_delivery_at:"2026-09-25T20:59:59.999Z",stage_started_at:"2026-09-21T10:00:00.000Z",...overrides});

describe("client operational status",()=>{
  it("separa descoberta, ativação e experiência ativa por plano",()=>{
    expect(experienceMode("free",null)).toBe("FREE_DISCOVERY");
    expect(experienceMode("paid",activation())).toBe("PAID_ACTIVATION");
    expect(experienceMode("premium",activation({current_stage:"ACTIVE_PROTOCOL",status:"COMPLETED"}))).toBe("PREMIUM_CONCIERGE");
  });
  it("mantém a progressão oficial de ativação",()=>{
    expect(stageProgress("ONBOARDING_REQUIRED")).toBeLessThan(stageProgress("TRAINING_REVIEW"));
    expect(stageProgress("TRAINING_REVIEW")).toBeLessThan(stageProgress("ACTIVE_PROTOCOL"));
  });
  it("deriva próxima ação, rota e SLA sem números simulados",()=>{
    vi.setSystemTime(new Date("2026-09-24T22:00:00.000Z"));
    const status=deriveOperationalStatus({activation:activation({current_stage:"PHOTO_PROTOCOL_REQUIRED",next_action:"Precisamos das suas fotos para continuar"}),trainingStatus:"WAITING_PREREQUISITES"});
    expect(status.nextRoute).toBe("/training/assessment");
    expect(status.nextAction).toBe("Precisamos das suas fotos para continuar");
    expect(status.sla).toBe("AT RISK");
    vi.useRealTimers();
  });
});