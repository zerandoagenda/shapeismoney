export function ScoreRing({ score, label = "SIM Score" }: { score: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, score));
  return (
    <div className="relative grid size-48 place-items-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${safe}%, var(--muted) 0)` }}>
      <div className="grid size-[calc(100%-10px)] place-items-center rounded-full bg-background text-center">
        <div><span className="font-display text-6xl text-foreground">{safe}</span><span className="text-muted-foreground">/100</span><p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-primary">{label}</p></div>
      </div>
    </div>
  );
}