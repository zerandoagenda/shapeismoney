export function ScoreRing({ score, label = "SIM Score" }: { score: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, score));
  return (
    <div className="relative grid size-52 place-items-center rounded-full border border-border bg-background/40 before:absolute before:inset-3 before:rounded-full before:border before:border-primary/25">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 208 208" aria-hidden="true"><circle cx="104" cy="104" r="100" fill="none" stroke="var(--border)" strokeWidth="1"/><circle cx="104" cy="104" r="100" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray={`${safe*6.28} 628`} strokeLinecap="round"/></svg>
      <div className="relative text-center">
        <div><span className="font-display text-7xl text-foreground">{safe}</span><span className="text-muted-foreground">/100</span><p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-primary">{label}</p></div>
      </div>
    </div>
  );
}