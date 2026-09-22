import { Link } from "@tanstack/react-router";
import officialLockup from "@/assets/shape-is-money-transparent.png";

export function Brand({ compact = false, impact = false }: { compact?: boolean; impact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center" aria-label="Shape Is Money">
      <img
        src={officialLockup}
        alt="Shape Is Money"
        width={349}
        height={239}
        className={`object-contain drop-shadow-[0_0_12px_color-mix(in_oklab,var(--text-ivory)_12%,transparent)] ${impact ? "h-auto w-52 sm:w-72" : compact ? "h-10 w-auto" : "h-16 w-auto"}`}
      />
    </Link>
  );
}