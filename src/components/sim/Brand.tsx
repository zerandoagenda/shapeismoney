import { Link } from "@tanstack/react-router";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Shape Is Money">
      <span className="grid size-10 place-items-center border border-primary font-display text-lg text-primary">SM</span>
      {!compact && <span className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground">Shape Is Money</span>}
    </Link>
  );
}