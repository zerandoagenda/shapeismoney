import { describe,expect,it } from "vitest";
import { classifyAttention,classifyPain,progressionDecision } from "./training-rules";
describe("training decisions",()=>{
  it("only suggests progression when every safety condition passes",()=>{expect(progressionDecision({allSetsReachRepTarget:true,techniqueOk:true,effortWithinTarget:true,relevantPain:false})).toBe("SUGGEST_LOAD_PROGRESSION");expect(progressionDecision({allSetsReachRepTarget:true,techniqueOk:false,effortWithinTarget:true,relevantPain:false})).toBe("MAINTAIN_OR_ADJUST")});
  it("prioritizes risk signals",()=>{expect(classifyAttention({pain:8,sleepQuality:5,energy:5,stress:1,completionRate:100,repeatedMisses:0})).toBe("RED");expect(classifyPain(3,"","" )).toBe("GREEN");expect(classifyPain(3,"formigamento","" )).toBe("RED")});
});