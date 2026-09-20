import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Brand } from "@/components/sim/Brand";
import { CinematicBackdrop } from "@/components/sim/CinematicBackdrop";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Shape Is Money — Executive Performance Concierge" },
    { name: "description", content: "Uma estrutura de performance humana para sustentar corpo, energia, presença e responsabilidades." },
    { property: "og:title", content: "Shape Is Money — Executive Performance Concierge" },
    { property: "og:description", content: "O corpo é o primeiro ativo de reputação." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Home,
});

const coherence = ["Corpo", "Energia", "Governo", "Percepção", "Execução", "Reputação"];
const axes = [["01", "Construção", "Forma e força"], ["02", "Capacidade", "Energia disponível"], ["03", "Governo", "Domínio da rotina"], ["04", "Percepção", "Presença percebida"], ["05", "Execução", "Evidência acumulada"]];

function Home() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <section className="relative flex min-h-screen flex-col justify-between px-5 py-6 sm:px-10 sm:py-8 lg:px-14">
        <CinematicBackdrop />
        <header className="relative z-20 flex items-start justify-between">
          <div className="text-[9px] uppercase tracking-[0.28em] text-foreground/55"><p>Disciplina</p><p>Constrói</p><p>Liberdade</p><span className="mt-3 block h-px w-8 bg-primary/70" /></div>
          <p className="hidden text-[9px] uppercase tracking-[0.28em] text-foreground/45 sm:block">Executive performance concierge</p>
          <div className="text-right text-[9px] uppercase tracking-[0.28em] text-foreground/55"><p>Caráter</p><p>Multiplica</p><p>Resultados</p><span className="ml-auto mt-3 block h-px w-8 bg-primary/70" /></div>
        </header>

        <div className="relative z-10 grid flex-1 items-center lg:grid-cols-[.78fr_1.22fr]">
          <div className="hidden self-center text-[9px] uppercase tracking-[0.3em] text-foreground/40 lg:block"><p>Hoje, mais presença.</p><p className="mt-2">Amanhã, mais horizonte.</p></div>
          <div className="sim-reveal flex flex-col items-center py-14 text-center">
            <Brand impact />
            <h1 className="mt-9 max-w-3xl text-4xl leading-[1.05] sm:text-6xl lg:text-7xl">O corpo é o primeiro<br /><span className="text-primary">ativo de reputação.</span></h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-foreground/65">Existe uma estrutura inteira trabalhando para você sustentar a vida que construiu.</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Button asChild variant="gold" className="h-12 px-8"><Link to="/auth" search={{ mode: "signup" }}>Iniciar diagnóstico <ArrowRight /></Link></Button>
              <Button asChild variant="ghost" className="h-12 px-8 text-foreground/70"><Link to="/auth">Já sou membro</Link></Button>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-end justify-between text-[9px] uppercase tracking-[0.28em] text-foreground/40"><span>Performance humana / 2026</span><a href="#tese" className="flex items-center gap-3 transition-colors hover:text-primary">Entrar na experiência <ArrowDown className="size-3" /></a></div>
      </section>

      <section id="tese" className="relative min-h-[86vh] border-t border-border px-5 py-28 sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[.4fr_1fr]">
          <p className="sim-kicker">Scene 01 / A tese</p>
          <div><h2 className="max-w-4xl text-5xl leading-[1.02] sm:text-7xl lg:text-8xl">Performance não começa na agenda.</h2><p className="mt-8 font-display text-3xl text-primary sm:text-4xl">Começa em quem executa.</p></div>
        </div>
      </section>

      <section className="relative min-h-screen bg-surface-coffee px-5 py-28 sm:px-10 lg:px-14">
        <div className="sim-grain absolute inset-0" />
        <div className="relative mx-auto max-w-7xl"><p className="sim-kicker">Scene 02 / A diferença</p><div className="mt-20 grid gap-16 lg:grid-cols-[1fr_.7fr]"><h2 className="text-5xl leading-[1.08] sm:text-7xl">Você construiu a empresa.<br />Construiu patrimônio.<br />Construiu responsabilidade.</h2><p className="self-end border-l border-primary/60 pl-7 font-display text-3xl leading-tight text-foreground/80">Mas o corpo que carrega tudo isso acompanhou?</p></div></div>
      </section>

      <section className="relative min-h-screen px-5 py-28 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[.45fr_1fr]"><div><p className="sim-kicker">Scene 03 / Coerência</p><h2 className="mt-6 text-5xl sm:text-7xl">Um sistema.<br />Seis sinais.</h2></div><div className="grid border-l border-border sm:grid-cols-2">{coherence.map((item,index)=><div key={item} className="group relative border-b border-r border-border px-7 py-10 transition-colors hover:bg-muted/30"><span className="text-[9px] tracking-[0.25em] text-primary">0{index+1}</span><p className="mt-8 font-display text-4xl">{item}</p><span className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-700 group-hover:w-full" /></div>)}</div></div></div>
      </section>

      <section className="relative min-h-screen overflow-hidden border-y border-border px-5 py-28 sm:px-10 lg:px-14">
        <CinematicBackdrop className="opacity-35" />
        <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-[.72fr_1.28fr] lg:items-center"><div><p className="sim-kicker">Scene 04 / O sistema</p><h2 className="mt-6 text-6xl sm:text-8xl">Shape Is<br />Money OS.</h2><p className="mt-7 max-w-md leading-7 text-foreground/65">Corpo, rotina e performance organizados como uma carteira de ativos pessoais.</p></div><div className="border border-border bg-background/70 p-6 shadow-2xl backdrop-blur-md sm:p-10"><div className="flex items-end justify-between border-b border-border pb-8"><div><p className="sim-kicker">Your performance portfolio</p><p className="mt-3 font-display text-6xl">82</p></div><span className="text-primary">+6.4% / 30D</span></div><div className="mt-8 grid grid-cols-2 gap-x-8 sm:grid-cols-4">{[["Energia","84"],["Sono","76"],["Consistência","91"],["Estresse","63"]].map(([l,v])=><div className="border-t border-border py-5" key={l}><p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{l}</p><p className="mt-4 font-display text-4xl">{v}</p></div>)}</div></div></div>
      </section>

      <section className="min-h-[86vh] px-5 py-28 sm:px-10 lg:px-14"><div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_.72fr]"><div><p className="sim-kicker">Scene 05 / Intelligence layer</p><h2 className="mt-6 text-6xl sm:text-8xl">Money<br />Brain.</h2></div><div className="self-center border-y border-border py-10"><p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Daily brief / 07:30</p><p className="mt-8 font-display text-4xl leading-tight">Seu treino permanece consistente. Seu principal gargalo esta semana foi recuperação.</p><p className="mt-8 text-xs text-muted-foreground">Insight baseado nos dados registrados.</p><button className="story-link mt-10 text-xs uppercase tracking-[0.18em] text-primary">Ver análise</button></div></div></section>

      <section className="bg-surface-wine px-5 py-28 sm:px-10 lg:px-14"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><p className="sim-kicker">Scene 06 / Executive performance</p><h2 className="mt-6 text-5xl sm:text-7xl">Cinco eixos.<br />Uma direção.</h2></div><p className="max-w-sm text-sm leading-7 text-foreground/65">Seu físico deve estar à altura daquilo que você carrega.</p></div><div className="mt-20 divide-y divide-border border-y border-border">{axes.map(([n,title,desc])=><div key={n} className="grid grid-cols-[44px_1fr] items-center gap-4 py-7 sm:grid-cols-[80px_1fr_1fr]"><span className="text-xs text-primary">{n}</span><span className="font-display text-3xl sm:text-4xl">{title}</span><span className="hidden text-right text-xs uppercase tracking-[0.16em] text-muted-foreground sm:block">{desc}</span></div>)}</div></div></section>

      <section className="flex min-h-[78vh] flex-col items-center justify-center px-5 py-28 text-center"><p className="sim-kicker">Scene 07 / Entrada</p><h2 className="mt-7 max-w-4xl text-5xl leading-[1.05] sm:text-7xl">Descubra onde sua performance está perdendo coerência.</h2><Button asChild variant="gold" className="mt-12 h-13 px-9"><Link to="/auth" search={{ mode: "signup" }}>Iniciar diagnóstico <ArrowRight /></Link></Button><p className="mt-20 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Shape Is Money · Executive Performance Concierge</p></section>
    </main>
  );
}