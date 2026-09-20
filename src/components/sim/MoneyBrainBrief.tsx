import { BrainCircuit } from "lucide-react";
import type { DailyBrief } from "@/lib/money-brain";

export function MoneyBrainBrief({ brief, compact = false }: { brief: DailyBrief; compact?: boolean }) {
  return <section className="relative overflow-hidden border-y border-border bg-surface-coffee/35 px-6 py-9">
    <div className="sim-grain pointer-events-none absolute inset-0" />
    <div className={`relative grid gap-7 ${compact ? "md:grid-cols-[auto_1fr]" : "md:grid-cols-[.3fr_1fr]"}`}>
      <div><BrainCircuit className="size-5 text-primary"/><p className="sim-kicker mt-4">Money Brain</p><p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Daily brief · {brief.priority}</p></div>
      <div><p className="font-display text-3xl leading-tight sm:text-4xl">{brief.message}</p>{brief.evidence.length > 0 && <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">{brief.evidence.map((item)=><span key={item} className="text-xs text-muted-foreground">— {item}</span>)}</div>}</div>
    </div>
  </section>;
}