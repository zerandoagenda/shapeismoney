import { Link } from "@tanstack/react-router";
import officialLockup from "@/assets/shape-is-money-official.png.asset.json";

export function Brand({ compact = false, impact = false }: { compact?: boolean; impact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center" aria-label="Shape Is Money">
      <img
        src={officialLockup.url}
        alt="Shape Is Money"
        width={349}
        height={239}
        className={`object-contain invert ${impact ? "h-auto w-52 sm:w-72" : compact ? "h-10 w-auto" : "h-16 w-auto"}`}
      />
    </Link>
  );
}