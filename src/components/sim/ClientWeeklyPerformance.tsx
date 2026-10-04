import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Dumbbell, Gauge, MessageSquareText } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type WeeklyReview = Tables<"weekly_reviews">;
type Session = Tables<"workout_sessions"> & { workouts: { name: string } | null };
type SetLog = Tables<"exercise_set_logs"> & { workout_exercises: { exercise_library: { name: string } | null } | null };

const scoreFields = [
  ["nutrition", "Alimentação"], ["sleep", "Sono"], ["stress", "Estresse"], ["energy", "Energia"],
  ["productivity", "Produtividade"], ["focus", "Foco"], ["schedule_control", "Controle da agenda"],
  ["relationships", "Relacionamentos"], ["quality_time", "Tempo de qualidade"],
  ["professional_performance", "Performance profissional"],
] as const;

const contextFields = [
  ["sleep_hours", "Horas de sono"], ["pain", "Dor"], ["hydration", "Hidratação"], ["weight_kg", "Peso"],
  ["body_feeling", "Resposta do corpo"], ["cardio", "Cardio"], ["activity", "Atividade fora do treino"],
  ["worked", "O que funcionou"], ["did_not_work", "O que não funcionou"], ["next_obstacle", "Próximo obstáculo"],
  ["schedule_change", "Mudança de agenda"], ["travel", "Viagem"], ["event", "Evento relevante"], ["free_text", "Observação livre"],
] as const;

const weekLabel = (value: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
const dayLabel = (value: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(value));
const inWeek = (value: string, weekStart: string) => { const time = new Date(value).getTime(); const start = new Date(`${weekStart}T00:00:00`).getTime(); return time >= start && time < start + 7 * 86400000; };
const mondayOf = (value: string) => { const date = new Date(value); const day = date.getDay(); date.setDate(date.getDate() - (day === 0 ? 6 : day - 1)); return date.toISOString().slice(0, 10); };
const answer = (value: unknown) => value === null || value === undefined || value === "" ? "Não informado" : String(value);

export function ClientWeeklyPerformance({ studentId }: { studentId: string }) {
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [setLogs, setSetLogs] = useState<SetLog[]>([]);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const since = new Date(Date.now() - 120 * 86400000).toISOString();
      const [reviewResult, sessionResult] = await Promise.all([
        supabase.from("weekly_reviews").select("*").eq("user_id", studentId).order("week_start", { ascending: false }).limit(16),
        supabase.from("workout_sessions").select("*,workouts(name)").eq("user_id", studentId).gte("started_at", since).order("started_at", { ascending: false }),
      ]);
      const nextSessions = (sessionResult.data ?? []) as Session[];
      const sessionIds = nextSessions.map((item) => item.id);
      const logResult = sessionIds.length
        ? await supabase.from("exercise_set_logs").select("*,workout_exercises(exercise_library(name))").eq("user_id", studentId).in("session_id", sessionIds).order("created_at", { ascending: false })
        : { data: [] };
      const nextReviews = reviewResult.data ?? [];
      setReviews(nextReviews);
      setSessions(nextSessions);
      setSetLogs((logResult.data ?? []) as unknown as SetLog[]);
      setSelectedWeek((current) => current || nextReviews[0]?.week_start || (nextSessions[0] ? mondayOf(nextSessions[0].started_at) : ""));
      setLoading(false);
    })();
  }, [studentId]);

  const selected = reviews.find((item) => item.week_start === selectedWeek) ?? null;
  const availableWeeks = useMemo(() => [...new Set([...reviews.map((item) => item.week_start), ...sessions.map((item) => mondayOf(item.started_at))])].sort().reverse(), [reviews, sessions]);
  const weekSessions = useMemo(() => selectedWeek ? sessions.filter((item) => inWeek(item.started_at, selectedWeek)) : [], [selectedWeek, sessions]);
  const weekSessionIds = useMemo(() => new Set(weekSessions.map((item) => item.id)), [weekSessions]);
  const weekLogs = useMemo(() => setLogs.filter((item) => weekSessionIds.has(item.session_id)), [setLogs, weekSessionIds]);
  const chart = useMemo(() => [...reviews].reverse().map((item) => ({
    week: dayLabel(item.week_start),
    adesao: item.planned_workouts ? Math.round(item.completed_workouts / item.planned_workouts * 100) : 0,
    energia: (item.energy ?? 0) * 20,
    sono: (item.sleep ?? 0) * 20,
    estresse: (item.stress ?? 0) * 20,
    dor: (item.pain ?? 0) * 10,
  })), [reviews]);

  if (loading) return <div className="border-y border-border py-10 text-sm text-muted-foreground">Carregando performance semanal…</div>;
  if (!availableWeeks.length) return <div className="border-y border-border py-10"><p className="sim-kicker">Performance semanal</p><h2 className="mt-3 text-3xl">Ainda sem registros semanais</h2><p className="mt-3 text-sm text-muted-foreground">Quando o aluno concluir uma revisão ou iniciar um treino, respostas, forças, alertas, sessões e cargas aparecerão aqui.</p></div>;

  const completed = weekSessions.filter((item) => Boolean(item.completed_at));
  const adherence = selected?.planned_workouts ? Math.round(selected.completed_workouts / selected.planned_workouts * 100) : null;
  const volume = weekLogs.reduce((total, item) => total + (item.load ?? 0) * (item.reps ?? 0), 0);
  const averageRpe = weekLogs.filter((item) => item.effort !== null).length ? weekLogs.filter((item) => item.effort !== null).reduce((total, item) => total + (item.effort ?? 0), 0) / weekLogs.filter((item) => item.effort !== null).length : null;
  const strengths = selected ? scoreFields.filter(([key]) => key !== "stress" && (selected[key] ?? 0) >= 4).map(([, label]) => label) : [];
  const attention = selected ? [
    ...scoreFields.filter(([key]) => key !== "stress" && (selected[key] ?? 5) <= 2).map(([, label]) => label),
    ...((selected.stress ?? 0) >= 4 ? ["Estresse elevado"] : []),
    ...((selected.pain ?? 0) >= 4 ? [`Dor ${selected.pain}/10`] : []),
    ...(adherence !== null && adherence < 70 ? [`Adesão ${adherence}%`] : []),
  ] : [];
  const exerciseGroups = new Map<string, SetLog[]>();
  for (const log of weekLogs) {
    const name = log.workout_exercises?.exercise_library?.name ?? "Exercício não identificado";
    exerciseGroups.set(name, [...(exerciseGroups.get(name) ?? []), log]);
  }

  return <div>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="sim-kicker">Performance semanal</p><h2 className="mt-3 text-4xl">Leitura para acompanhamento</h2></div><Select value={selectedWeek} onValueChange={setSelectedWeek}><SelectTrigger className="w-full sm:w-64" aria-label="Semana analisada"><SelectValue /></SelectTrigger><SelectContent>{availableWeeks.map((week) => <SelectItem key={week} value={week}>Semana de {weekLabel(week)}</SelectItem>)}</SelectContent></Select></div>

    <div className="mt-7 grid gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
      <Metric label="Adesão" value={adherence === null ? "—" : `${adherence}%`} detail={`${selected?.completed_workouts ?? 0} de ${selected?.planned_workouts ?? 0} previstos`} />
      <Metric label="Sessões registradas" value={String(completed.length)} detail={`${weekSessions.length} iniciadas`} />
      <Metric label="Volume registrado" value={volume ? `${Math.round(volume).toLocaleString("pt-BR")} kg` : "—"} detail={`${weekLogs.length} séries`} />
      <Metric label="Esforço médio" value={averageRpe === null ? "—" : averageRpe.toFixed(1)} detail="RPE das séries" />
      <Metric label="Atenção" value={selected?.attention_level ?? "—"} detail={selected?.decision_classification?.replaceAll("_", " ") ?? "Sem classificação"} />
    </div>

    <section className="mt-8 grid gap-8 border-y border-border py-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
      <div className="min-w-0"><p className="sim-kicker">Evolução · escala comparável 0–100</p><div className="mt-5 h-72 w-full" role="img" aria-label="Gráfico da evolução semanal de adesão, energia, sono, estresse e dor"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><CartesianGrid stroke="var(--border)" vertical={false}/><XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={10}/><YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={10}/><Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 0 }}/><Line type="monotone" dataKey="adesao" name="Adesão" stroke="var(--primary)" strokeWidth={2}/><Line type="monotone" dataKey="energia" name="Energia" stroke="var(--foreground)"/><Line type="monotone" dataKey="sono" name="Sono" stroke="var(--muted-foreground)"/><Line type="monotone" dataKey="estresse" name="Estresse" stroke="var(--destructive)" strokeDasharray="4 4"/><Line type="monotone" dataKey="dor" name="Dor" stroke="var(--destructive)"/></LineChart></ResponsiveContainer></div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase text-muted-foreground"><span className="text-primary">— Adesão</span><span>— Energia</span><span>— Sono</span><span className="text-destructive">-- Estresse</span><span className="text-destructive">— Dor</span></div></div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1"><Signal title="Pontos fortes" icon={CheckCircle2} items={strengths} empty="Nenhum sinal forte conclusivo nesta semana."/><Signal title="Pontos de atenção" icon={AlertTriangle} items={attention} empty="Nenhum ponto crítico registrado nesta semana."/></div>
    </section>

    <section className="mt-10"><div className="flex items-center gap-3"><MessageSquareText className="size-4 text-primary"/><div><p className="sim-kicker">Revisão completa</p><h3 className="mt-2 text-3xl">Tudo o que o aluno respondeu</h3></div></div>{selected ? <div className="mt-6 grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">{scoreFields.map(([key, label]) => <Answer key={key} label={label} value={selected[key] === null ? "Não informado" : `${selected[key]}/5`} />)}{contextFields.map(([key, label]) => <Answer key={key} label={label} value={answer(selected[key])} />)}</div> : <p className="mt-5 border-y border-border py-8 text-sm text-muted-foreground">O aluno treinou nesta semana, mas ainda não enviou a revisão semanal.</p>}</section>

    <section className="mt-10"><div className="flex items-center gap-3"><Activity className="size-4 text-primary"/><div><p className="sim-kicker">Sessões da semana</p><h3 className="mt-2 text-3xl">Execução e resposta</h3></div></div><div className="mt-5 divide-y divide-border border-y border-border">{weekSessions.map((session) => <div key={session.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_repeat(4,minmax(80px,auto))]"><div><p>{session.workouts?.name ?? "Sessão de treino"}</p><p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(session.started_at))}{session.client_comment ? ` · ${session.client_comment}` : ""}</p></div><SessionValue label="Conclusão" value={session.completion_percent === null ? "—" : `${session.completion_percent}%`}/><SessionValue label="Duração" value={session.duration_minutes === null ? "—" : `${session.duration_minutes} min`}/><SessionValue label="RPE" value={answer(session.session_rpe)}/><SessionValue label="Dor" value={answer(session.session_pain)}/></div>)}{!weekSessions.length && <p className="py-8 text-sm text-muted-foreground">Nenhuma sessão registrada nesta semana.</p>}</div></section>

    <section className="mt-10"><div className="flex items-center gap-3"><Dumbbell className="size-4 text-primary"/><div><p className="sim-kicker">Histórico de cargas</p><h3 className="mt-2 text-3xl">Série por série</h3></div></div><div className="mt-5 space-y-4">{[...exerciseGroups.entries()].map(([name, logs]) => <article key={name} className="border-y border-border py-5"><div className="flex flex-wrap items-end justify-between gap-3"><h4 className="text-xl">{name}</h4><span className="sim-kicker">{logs.length} séries registradas</span></div><div className="mt-4 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">{[...logs].sort((a,b) => a.created_at.localeCompare(b.created_at) || a.set_number - b.set_number).map((log) => <div key={log.id} className="bg-background p-4"><p className="sim-kicker">Série {log.set_number}</p><p className="mt-2 text-lg">{log.load === null ? "—" : `${log.load} kg`} · {log.reps === null ? "—" : `${log.reps} reps`}</p><p className="mt-1 text-xs text-muted-foreground">RPE {answer(log.effort)} · Dor {answer(log.pain)} · Técnica {log.technique_ok === null ? "—" : log.technique_ok ? "OK" : "Atenção"}</p></div>)}</div></article>)}{!weekLogs.length && <p className="border-y border-border py-8 text-sm text-muted-foreground">O aluno ainda não registrou cargas nesta semana.</p>}</div></section>
  </div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="min-w-0 bg-background p-5"><p className="sim-kicker">{label}</p><p className="mt-3 break-words font-display text-3xl text-primary">{value}</p><p className="mt-1 break-words text-xs text-muted-foreground">{detail}</p></div>; }
function Answer({ label, value }: { label: string; value: string }) { return <div className="min-w-0 bg-background p-4"><p className="text-[9px] uppercase text-muted-foreground">{label}</p><p className="mt-2 break-words text-sm leading-6">{value}</p></div>; }
function SessionValue({ label, value }: { label: string; value: string }) { return <div><p className="text-[9px] uppercase text-muted-foreground">{label}</p><p className="mt-1 text-sm">{value}</p></div>; }
function Signal({ title, icon: Icon, items, empty }: { title: string; icon: typeof Gauge; items: string[]; empty: string }) { return <div className="border-l border-primary pl-5"><div className="flex items-center gap-2"><Icon className="size-4 text-primary"/><p className="sim-kicker">{title}</p></div>{items.length ? <ul className="mt-4 space-y-2 text-sm">{items.map((item) => <li key={item}>— {item}</li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">{empty}</p>}</div>; }