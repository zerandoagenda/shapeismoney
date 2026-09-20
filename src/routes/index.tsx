import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/sim/Brand";
import { Button } from "@/components/ui/button";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({ head:()=>({meta:[{title:"Shape Is Money OS — Performance Executiva"},{name:"description",content:"Governo do corpo para líderes que carregam grandes responsabilidades."},{property:"og:title",content:"Shape Is Money OS"},{property:"og:description",content:"O corpo é o primeiro ativo de reputação."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}), component: Index });

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-7 lg:px-14 lg:py-10">
      <header className="relative z-10 flex items-center justify-between"><Brand/><Button asChild variant="quiet"><Link to="/auth">Acessar</Link></Button></header>
      <div className="pointer-events-none absolute left-1/2 top-20 h-[70vh] w-[min(66vw,760px)] -translate-x-1/2 rounded-t-full border border-primary/35 bg-card shadow-2xl"/>
      <section className="relative z-10 mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center text-center">
        <p className="sim-kicker">Executive wellness · performance executiva</p>
        <h1 className="mt-8 max-w-4xl text-5xl leading-[1.08] sm:text-7xl lg:text-8xl">Shape Is Money</h1>
        <p className="mt-7 max-w-xl font-display text-2xl text-muted-foreground sm:text-3xl">O corpo é o primeiro ativo de reputação.</p>
        <Button asChild variant="gold" className="mt-10 h-12 px-7 uppercase tracking-[0.15em]"><Link to="/auth">Entrar no sistema <ArrowRight/></Link></Button>
      </section>
      <div className="relative z-10 grid gap-4 border-t border-border pt-7 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:grid-cols-5">{["Construção","Capacidade","Governo","Percepção","Execução"].map(x=><span key={x}>{x}</span>)}</div>
    </main>
  );
}
