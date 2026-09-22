import { useEffect, useState } from "react";
import officialLogo from "@/assets/shape-is-money-transparent.png";

type SystemSignal = { label: string; status: string; active: boolean };

export function CinematicEntry({ name, priority, signals, protocolTitle }: { name: string; priority: string; signals: SystemSignal[]; protocolTitle?: string | null | undefined }) {
  const [visible, setVisible] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.localStorage.getItem("sim-reduced-motion") === "true";
    if (reduced || window.sessionStorage.getItem("sim-command-entry") === "seen") return;
    setVisible(true);
    const first = window.setTimeout(() => setFrame(1), 760);
    const second = window.setTimeout(() => setFrame(2), 1700);
    const finish = window.setTimeout(() => {
      window.sessionStorage.setItem("sim-command-entry", "seen");
      setVisible(false);
    }, 2850);
    return () => { window.clearTimeout(first); window.clearTimeout(second); window.clearTimeout(finish); };
  }, []);

  if (!visible) return null;
  return <div className={`sim-entry fixed inset-0 z-[100] ${frame===2?"sim-entry-leaving":""}`} role="status" aria-live="polite">
    <div className="sim-grain absolute inset-0"/><div className="sim-entry-light absolute inset-0"/>
    <div className="relative flex h-full items-center justify-center px-6">
      <div className={`absolute text-center transition-all duration-700 ${frame===0?"opacity-100 blur-0":"pointer-events-none -translate-y-3 opacity-0 blur-sm"}`}>
        <div className="sim-entry-logo-stage mx-auto w-44 sm:w-60">
          <span className="sim-entry-logo-halo" aria-hidden="true"/>
          <img src={officialLogo} alt="Shape Is Money" className="sim-entry-logo relative h-auto w-full"/>
          <span className="sim-entry-logo-glint" aria-hidden="true"/>
        </div>
        <p className="mt-8 text-[9px] uppercase tracking-[0.38em] text-foreground/55">Executive Performance System</p>
      </div>
      <div className={`absolute inset-x-5 max-h-[calc(100dvh-3rem)] overflow-hidden sm:inset-x-auto sm:w-full sm:max-w-xl transition-all duration-700 ${frame===1?"opacity-100":"pointer-events-none translate-y-3 opacity-0"}`}>
        <p className="sim-kicker text-center">Performance OS</p><h2 className="mt-4 text-center text-3xl sm:text-5xl">Inicializando seu ambiente</h2>
        <div className="mt-8 divide-y divide-border border-y border-border sm:mt-10">{signals.map(signal=><div key={signal.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 text-[9px] uppercase sm:text-[10px]"><span className="truncate">{signal.label}</span><span className={`shrink-0 ${signal.active?"text-primary":"text-muted-foreground"}`}><i className="mr-2 inline-block size-1 rounded-full bg-current"/>{signal.status}</span></div>)}</div>
      </div>
      <div className={`absolute inset-x-5 min-w-0 text-center transition-all duration-700 sm:inset-x-auto sm:max-w-3xl ${frame===2?"opacity-100":"pointer-events-none translate-y-3 opacity-0"}`}>
        {protocolTitle&&<p className="sim-kicker mb-5 line-clamp-2">{protocolTitle} · ativo</p>}<p className="break-words font-display text-5xl uppercase sm:text-8xl">{name},</p><p className="mt-4 break-words font-display text-3xl leading-tight sm:text-5xl">{priority === "Construir evidência" ? "você tem uma prioridade agora." : <><span className="text-primary">{priority}</span> é sua prioridade agora.</>}</p>
      </div>
    </div>
  </div>;
}