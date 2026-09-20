import architectureImage from "@/assets/sim-architecture-hero.jpg";

export function CinematicBackdrop({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <img
        src={architectureImage}
        alt=""
        width={1920}
        height={1080}
        className="sim-ambient-image h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--surface-black)_0%,transparent_45%,var(--surface-black-soft)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--surface-black-fade)_0%,transparent_38%,var(--surface-black)_100%)]" />
      <div className="sim-grain absolute inset-0" />
      <div className="sim-light-sweep absolute inset-y-0 w-1/4" />
    </div>
  );
}