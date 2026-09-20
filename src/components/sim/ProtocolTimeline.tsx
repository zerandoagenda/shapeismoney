const statuses = [
  ["data_received", "Dados recebidos"], ["in_analysis", "Em análise"], ["building", "Em construção"],
  ["in_review", "Em revisão"], ["approved", "Aprovado"], ["published", "Publicado"],
] as const;

export function ProtocolTimeline({ status = "data_received" }: { status?: string }) {
  const active = Math.max(0, statuses.findIndex(([key]) => key === status));
  return <ol className="mt-8 grid gap-0 sm:grid-cols-6">{statuses.map(([key, label], index) => <li key={key} className="relative border-t border-border pt-5 sm:px-3"><span className={`absolute -top-1.5 left-0 size-3 rounded-full border ${index <= active ? "border-primary bg-primary" : "border-border bg-background"}`}/><p className={`text-[9px] uppercase tracking-[0.14em] ${index <= active ? "text-foreground" : "text-muted-foreground"}`}>{label}</p></li>)}</ol>;
}