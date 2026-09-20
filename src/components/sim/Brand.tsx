import { Link } from "@tanstack/react-router";
import officialLockup from "@/assets/sim-official-lockup.png.asset.json";

export function Brand({ compact = false, impact = false }: { compact?: boolean; impact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center" aria-label="Shape Is Money">
      <img
        src={officialLockup.url}
        alt="Shape Is Money"
        width={430}
        height={518}
        className={impact ? "h-auto w-48 sm:w-64" : compact ? "h-11 w-auto" : "h-16 w-auto"}
      />
    </Link>
  );
}