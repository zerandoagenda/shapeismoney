import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, CheckCircle2, Dumbbell, Gauge, Moon, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/sim/AppShell";
import { UsageTracker } from "@/components/sim/UsageTracker";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { adherencePercent, average, changeFromFirst, readPerformance } from "@/lib/performance-insights";

export const Route = createFileRoute("/_authenticated/performance")({
  head: () => ({ meta: [{ title: "Minha performance — Shape Is Money" }, { name: "description", content: "Sua evolução semanal em uma leitura simples e prática." }, { property: "og:title", content: "Minha performance — Shape Is Money" }, { property: "og:description", content: "Sua evolução semanal em uma leitura simples e prática." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

type WeeklyReview = Tables<"weekly_reviews">;
type Session = Tables<"workout_sessions">;
type Score = Tables<"sim_scores">;
type Checkin = Tables<"daily_checkins">;

const pillars = [["construction", "Construção"], ["capacity", "Capacidade"], ["governance", "Governo"], ["perception", "Percepção"], ["execution", "Execução"]] as const;
const dateLabel = (value: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));

function Page() {
  const [scores, setScores] = useState<Score[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const [scoreResult, checkinResult, sessionResult, reviewResult] = await Promise.all([
        supabase.from("sim_scores").select("*").eq("user_id", auth.user.id).order("created_at"),
        supabase.from("daily_checkins").select("*").eq("user_id", auth.user.id).order("checkin_date", { ascending: false }).limit(30),
        supabase.from("workout_sessions").select("*").eq("user_id", auth.user.id).order("started_at", { ascending: false }).limit(40),
        supabase.from("weekly_reviews").select("*").eq("user_id", auth.user.id).order("week_start", { ascending: false }).limit(12),
      ]);
      setScores(scoreResult.data ?? []);
      setCheckins(checkinResult.data ?? []);
      setSessions(sessionResult.data ?? []);
      setReviews(reviewResult.data ?? []);
      setLoading(false);
    })();
  }, []);

  const latestScore = scores.at(-1) ?? null;
  const latestReview = reviews[0] ?? null;
  const lastSevenCheckins = checkins.slice(0, 7);
  const completedSevenDays = sessions.filter((item) => item.completed_at && Date.now() - new Date(item.completed_at).getTime() <= 7 * 86400000);
  const adherence = latestReview ? adherencePercent(latestReview.completed_workouts, latestReview.planned_workouts) : null;
  const reading = readPerformance({
    adherence,
    energy: latestReview?.energy ?? average(lastSevenCheckins.map((item) => item.energy)),
    sleep: latestReview?.sleep ?? average(lastSevenCheckins.map((item) => item.sleep_quality)),
    stress: latestReview?.stress ?? average(lastSevenCheckins.map((item) => item.stress)),
    pain: latestReview?.pain ?? average(lastSevenCheckins.map((item) => item.pain)),
  });
  const chart = useMemo(() => [...reviews].reverse().map((item) => ({ week: dateLabel(item.week_start), adesao: adherencePercent(item.completed_workouts, item.planned_workouts), energia: item.energy === null ? null : item.energy * 20, sono: item.sleep === null ? null : item.sleep * 20 })), [reviews]);
  const scoreChange = changeFromFirst(scores.map((item) => item.total));

  if (loading) return <AppShell><UsageTracker module="performance"/><div className="grid min-h-[70vh] place-items-center"><p className="sim-kicker">Organizando sua performance</p></div></AppShell>;

  return <AppShell><UsageTracker module="performance"/><main className="mx-auto min-w-0 max-w-6xl px-4 py-7 sm:px-6 sm:py-12">
    <header className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="min-w-0"><p className="sim-kicker">Minha performance</p><h1 className="mt-3 text-4xl leading-tight sm:text-6xl">Uma leitura simples da sua semana.</h1><p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">Treino, recuperação e evolução reunidos para você saber onde está e qual é o próximo passo.</p></div>
      <div className={`border-l-2 px-5 py-3 ${reading.tone === "attention" ? "border-destructive" : "border-primary"}`}><p className="sim-kicker">Como você está</p><p className="mt-2 text-2xl">{reading.label}</p><p className="mt-1 max-w-xs text-sm text-muted-foreground">{reading.summary}</p></div>
    </header>

    <section className="grid border-b border-border min-[430px]:grid-cols-2 lg:grid-cols-4">
      <Kpi icon={Gauge} label="SIM Score" value={latestScore ? String(latestScore.total) : "—"} detail={scoreChange === null ? "primeira leitura" : `${scoreChange >= 0 ? "+" : ""}${scoreChange} desde o início`} />
      <Kpi icon={Dumbbell} label="Treinos em 7 dias" value={String(completedSevenDays.length)} detail={latestReview?.planned_workouts ? `${latestReview.planned_workouts} planejados` : "sessões concluídas"} />
      <Kpi icon={Moon} label="Sono" value={formatScale(latestReview?.sleep ?? average(lastSevenCheckins.map((item) => item.sleep_quality)))} detail="média recente" />
      <Kpi icon={Activity} label="Energia" value={formatScale(latestReview?.energy ?? average(lastSevenCheckins.map((item) => item.energy)))} detail="média recente" />
    </section>

    <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.75fr)]">
      <div className="min-w-0"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="sim-kicker">Últimas semanas</p><h2 className="mt-2 text-3xl">Seu ritmo</h2></div><p className="text-xs text-muted-foreground">Escala comparável de 0 a 100</p></div>{chart.length ? <><div className="mt-6 h-64 min-w-0" role="img" aria-label="Evolução de adesão, energia e sono"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid stroke="var(--border)" vertical={false}/><XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={10}/><YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={10}/><Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 0 }}/><Line type="monotone" dataKey="adesao" name="Treinos" stroke="var(--primary)" strokeWidth={3} connectNulls/><Line type="monotone" dataKey="energia" name="Energia" stroke="var(--chart-2)" strokeWidth={2} connectNulls/><Line type="monotone" dataKey="sono" name="Sono" stroke="var(--foreground)" strokeWidth={1.5} connectNulls/></LineChart></ResponsiveContainer></div><div className="mt-3 flex flex-wrap gap-4 text-[10px] uppercase text-muted-foreground"><span className="text-primary">— Treinos</span><span>— Energia</span><span>— Sono</span></div></> : <Empty text="Conclua sua primeira revisão semanal para acompanhar sua evolução aqui."/>}</div>
      <div className="space-y-6"><ReadingList icon={CheckCircle2} title="O que está funcionando" items={reading.strengths} empty="Continue registrando para identificar seus pontos fortes."/><ReadingList icon={ShieldAlert} title="Onde prestar atenção" items={reading.attention} empty="Nenhum alerta relevante nos registros atuais."/></div>
    </section>

    <section className="border-y border-border py-9"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="sim-kicker">Cinco pilares</p><h2 className="mt-2 text-3xl">Sua construção atual</h2></div>{latestScore && <p className="text-sm text-muted-foreground">Leitura de {dateLabel(latestScore.created_at)}</p>}</div>{latestScore ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{pillars.map(([key, label]) => <div key={key} className="min-w-0"><div className="flex items-end justify-between gap-2"><p className="text-xs">{label}</p><strong className="font-display text-3xl font-normal text-primary">{latestScore[key]}</strong></div><div className="mt-3 h-1 bg-muted"><span className="block h-1 bg-primary" style={{ width: `${latestScore[key]}%` }}/></div></div>)}</div> : <Empty text="Seu diagnóstico inicial vai formar a primeira leitura dos cinco pilares."/>}</section>

    <section className="grid gap-5 py-10 sm:grid-cols-2"><div className="border-l border-primary pl-5"><p className="sim-kicker">Próximo passo</p><h3 className="mt-3 text-2xl">Mantenha seus registros em dia.</h3><p className="mt-2 text-sm text-muted-foreground">Eles permitem que sua direção seja ajustada com base no que realmente aconteceu.</p></div><div className="flex flex-col gap-3 sm:items-end sm:justify-center"><Button asChild variant="gold"><Link to="/training">Abrir meu treino <ArrowRight/></Link></Button><Button asChild variant="quiet"><Link to="/weekly-review">Fazer revisão semanal</Link></Button></div></section>
  </main></AppShell>;
}

function formatScale(value: number | null) { return value === null ? "—" : `${value.toFixed(1)}/5`; }
function Kpi({ icon: Icon, label, value, detail }: { icon: typeof Gauge; label: string; value: string; detail: string }) { return <article className="min-w-0 border-b border-border p-5 min-[430px]:border-r lg:border-b-0"><div className="flex items-center justify-between gap-2"><p className="sim-kicker truncate">{label}</p><Icon className="size-4 shrink-0 text-primary"/></div><p className="mt-3 font-display text-4xl">{value}</p><p className="mt-1 break-words text-xs text-muted-foreground">{detail}</p></article>; }
function ReadingList({ icon: Icon, title, items, empty }: { icon: typeof TrendingUp | typeof TrendingDown; title: string; items: string[]; empty: string }) { return <article className="border-t border-border pt-5"><div className="flex items-center gap-2"><Icon className="size-4 text-primary"/><p className="sim-kicker">{title}</p></div>{items.length ? <ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="text-sm">— {item}</li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">{empty}</p>}</article>; }
function Empty({ text }: { text: string }) { return <div className="mt-6 border-y border-border py-9 text-sm text-muted-foreground">{text}</div>; }