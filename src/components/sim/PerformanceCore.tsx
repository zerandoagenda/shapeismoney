import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

const pillars = [
  ["construction","Construção","Estrutura física e consistência."],
  ["capacity","Capacidade","Energia e recuperação disponíveis."],
  ["governance","Governo","Controle da rotina e das decisões."],
  ["perception","Percepção","Coerência entre presença e contexto."],
  ["execution","Execução","Intenção convertida em evidência."],
] as const;
const nodePositions=["left-1/2 top-[2%]","right-[1%] top-[29%]","right-[10%] bottom-[10%]","left-[10%] bottom-[10%]","left-[1%] top-[29%]"];

export function PerformanceCore({ score }: { score: Tables<"sim_scores"> | null }) {
  const [active,setActive]=useState<(typeof pillars)[number][0] | null>(null);
  const selected=pillars.find(item=>item[0]===active);
  return <div className="relative mx-auto aspect-square w-full max-w-[440px]" aria-label="SIM Performance Core">
    <div className="sim-core-orbit absolute inset-[6%] rounded-full border border-border"/><div className="sim-core-orbit-reverse absolute inset-[16%] rounded-full border border-primary/25"/><div className="absolute inset-[28%] grid place-items-center rounded-full border border-border bg-background/70 backdrop-blur-md"><div className="text-center">{score?<><p className="font-display text-7xl text-primary sm:text-8xl">{score.total}</p><p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">SIM Score</p></>:<><p className="font-display text-3xl leading-none">Calibrando</p><p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-primary">seu sistema</p></>}</div></div>
    {pillars.map(([key,label],index)=>{const value=score?.[key];return <Button key={key} type="button" variant="ghost" aria-label={`Entender ${label}`} onMouseEnter={()=>setActive(key)} onMouseLeave={()=>setActive(null)} onFocus={()=>setActive(key)} onBlur={()=>setActive(null)} onClick={()=>setActive(active===key?null:key)} className={`absolute z-10 h-auto -translate-x-1/2 -translate-y-1/2 flex-col items-start gap-0 px-2 py-1 transition-all duration-500 ${nodePositions[index]} ${active===key?"text-primary":"text-muted-foreground hover:text-foreground"}`}><span className="block text-[8px] uppercase tracking-[0.18em]">{label}</span><strong className="font-display text-2xl font-normal">{value??"—"}</strong></Button>})}
    <div className={`absolute inset-x-[18%] bottom-[6%] z-20 border border-border bg-background/95 p-4 text-center text-xs leading-5 backdrop-blur-md transition-all ${selected?"translate-y-0 opacity-100":"pointer-events-none translate-y-2 opacity-0"}`}>{selected?.[2]}</div>
  </div>;
}