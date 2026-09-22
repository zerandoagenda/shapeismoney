import { useEffect, useState } from "react";
import { createFileRoute,Link } from "@tanstack/react-router";
import { Check, Clock3, Play, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/sim/AppShell";import{UsageTracker}from"@/components/sim/UsageTracker";
import { LockedFeature } from "@/components/sim/LockedFeature";
import { ProtocolTimeline } from "@/components/sim/ProtocolTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEntitlement } from "@/hooks/use-entitlement";
import { progressionDecision } from "@/lib/training-rules";
import { ExerciseDemo } from "@/components/sim/ExerciseDemo";
import { TeamConversation } from "@/components/sim/TeamConversation";

export const Route = createFileRoute("/_authenticated/training")({ head: () => ({ meta: [{ title: "Treino — SIM OS" }, { name: "description", content: "Seu protocolo de construção e capacidade." }, { property: "og:title", content: "Treino — SIM OS" }, { property: "og:description", content: "Execute seu protocolo com clareza." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Page });
type Exercise = { id: string; sets: number; reps: string; rep_min:number|null; rep_max:number|null; initial_load: number | null; rest_seconds: number; target_effort_type:string; target_effort:number|null; target_rpe: number | null; notes: string | null; reason_for_inclusion:string|null; pain_rule:string|null; sequence: number; exercise_library: { id:string; name: string; muscle_group: string; video_storage_path:string|null; image_storage_path:string|null; video_url:string|null; image_url:string|null } | null };
type Workout = { id: string; name: string; estimated_minutes: number | null; notes: string | null; variant_type:string; workout_exercises: Exercise[] };
type Program = { id: string; cycle_id:string|null; title: string; objective: string | null; why_this_plan:string|null; workouts: Workout[] };
type SetEntry = { load: string; reps: string; rpe: string; pain: string; techniqueOk: boolean; completed: boolean };
type ExerciseEntry = { sets: Record<number, SetEntry> };
type Log = Record<string, ExerciseEntry>;
const emptySet = (): SetEntry => ({ load: "", reps: "", rpe: "", pain: "", techniqueOk: true, completed: false });
const formatElapsed = (seconds: number) => [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(value => String(value).padStart(2, "0")).join(":");
function Page() {
  const entitlement = useEntitlement("can_access_training");
  const [program, setProgram] = useState<Program | null>(null);
  const [protocolStatus, setProtocolStatus] = useState("data_received");
  const [active, setActive] = useState<Workout | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState<Log>({});
  const [sessionRpe, setSessionRpe] = useState("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const [programResult, protocol] = await Promise.all([
        supabase.from("workout_programs").select("id,cycle_id,title,objective,why_this_plan,workouts(id,name,estimated_minutes,notes,sequence,variant_type,workout_exercises(id,sets,reps,rep_min,rep_max,initial_load,rest_seconds,target_rpe,target_effort_type,target_effort,notes,reason_for_inclusion,pain_rule,sequence,exercise_library(id,name,muscle_group,video_storage_path,image_storage_path,video_url,image_url)))").eq("user_id", auth.user.id).eq("status", "published").order("published_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("protocols").select("status").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      const loadedProgram = programResult.data as unknown as Program | null;
      setProgram(loadedProgram);
      setProtocolStatus(protocol.data?.status ?? "data_received");
      if (loadedProgram) {
        const { data: openSession } = await supabase.from("workout_sessions").select("id,workout_id,started_at,session_rpe,client_comment").eq("user_id", auth.user.id).eq("status", "started").order("started_at", { ascending: false }).limit(1).maybeSingle();
        const workout = loadedProgram.workouts.find(item => item.id === openSession?.workout_id);
        if (openSession && workout) {
          const { data: rows } = await supabase.from("exercise_set_logs").select("workout_exercise_id,set_number,load,reps,effort,technique_ok,pain").eq("session_id", openSession.id);
          const restored: Log = {};
          for (const exercise of workout.workout_exercises) {
            const exerciseRows = (rows ?? []).filter(row => row.workout_exercise_id === exercise.id);
            restored[exercise.id] = { sets: Object.fromEntries(Array.from({ length: exercise.sets }, (_, index) => {
              const row = exerciseRows.find(candidate => candidate.set_number === index + 1);
              return [index + 1, row ? { load: row.load === null ? "" : String(row.load), reps: row.reps === null ? "" : String(row.reps), rpe: row.effort === null ? "" : String(row.effort), pain: String(row.pain ?? 0), techniqueOk: row.technique_ok ?? true, completed: row.load !== null || row.reps !== null } : emptySet()];
            })) };
          }
          setSessionId(openSession.id);
          setStartedAt(new Date(openSession.started_at));
          setSessionRpe(openSession.session_rpe === null ? "" : String(openSession.session_rpe));
          setComment(openSession.client_comment ?? "");
          setLog(restored);
          setActive({ ...workout, workout_exercises: [...workout.workout_exercises].sort((a, b) => a.sequence - b.sequence) });
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!startedAt || done) return;
    const update = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, done]);

  function initialExerciseLog(workout: Workout): Log {
    return Object.fromEntries(workout.workout_exercises.map(exercise => [exercise.id, { sets: Object.fromEntries(Array.from({ length: exercise.sets }, (_, index) => [index + 1, emptySet()])) }]));
  }

  async function start(workout: Workout) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data } = await supabase.from("workout_sessions").insert({ user_id: auth.user.id, workout_id: workout.id, exercise_log: [] }).select("id,started_at").single();
    if (!data) return;
    await supabase.from("crm_events").insert({ user_id: auth.user.id, event_type: "workout.started", metadata: { workout_id: workout.id, session_id: data.id } });
    setSessionId(data.id);
    setStartedAt(new Date(data.started_at));
    setLog(initialExerciseLog(workout));
    setActive({ ...workout, workout_exercises: [...workout.workout_exercises].sort((a, b) => a.sequence - b.sequence) });
  }

  async function updateSet(exercise: Exercise, setNumber: number, patch: Partial<SetEntry>) {
    const currentExercise = log[exercise.id] ?? { sets: {} };
    const currentSet = currentExercise.sets[setNumber] ?? emptySet();
    const nextSet = { ...currentSet, ...patch };
    const next = { ...log, [exercise.id]: { sets: { ...currentExercise.sets, [setNumber]: nextSet } } };
    setLog(next);
    if (!sessionId) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await Promise.all([
      supabase.from("exercise_set_logs").upsert({ session_id: sessionId, workout_exercise_id: exercise.id, user_id: auth.user.id, set_number: setNumber, load: nextSet.load ? Number(nextSet.load) : null, reps: nextSet.reps ? Number(nextSet.reps) : null, effort: nextSet.rpe ? Number(nextSet.rpe) : null, effort_type: "RPE", technique_ok: nextSet.techniqueOk, pain: nextSet.pain ? Number(nextSet.pain) : 0 }, { onConflict: "session_id,workout_exercise_id,set_number" }),
      supabase.from("workout_sessions").update({ exercise_log: Object.entries(next).map(([exercise_id, values]) => ({ exercise_id, sets: values.sets })) }).eq("id", sessionId),
    ]);
  }

  async function uploadTechnique(exercise: Exercise, file: File) {
    if (!active || !exercise.exercise_library) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const path = `${auth.user.id}/technique/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const upload = await supabase.storage.from("training-private").upload(path, file, { contentType: file.type });
    if (upload.error) return;
    await supabase.from("technique_videos").insert({ client_id: auth.user.id, workout_id: active.id, exercise_id: exercise.exercise_library.id, storage_path: path, mime_type: file.type });
  }

  async function finish() {
    if (!sessionId || !active || !startedAt) return;
    const completed = active.workout_exercises.filter(exercise => Array.from({ length: exercise.sets }, (_, index) => log[exercise.id]?.sets[index + 1]?.completed).every(Boolean)).length;
    const percent = active.workout_exercises.length ? Math.round(completed / active.workout_exercises.length * 100) : 0;
    const duration = Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 60000));
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const allSets = Object.values(log).flatMap(item => Object.values(item.sets));
    const sessionPain = Math.max(0, ...allSets.map(item => Number(item.pain) || 0));
    await supabase.from("workout_sessions").update({ status: "completed", completed_at: new Date().toISOString(), duration_minutes: duration, completion_percent: percent, session_rpe: sessionRpe ? Number(sessionRpe) : null, session_pain: sessionPain, client_comment: comment || null, exercise_log: Object.entries(log).map(([exercise_id, values]) => ({ exercise_id, sets: values.sets })) }).eq("id", sessionId);
    const progressions = active.workout_exercises.filter(exercise => {
      const sets = Object.values(log[exercise.id]?.sets ?? {});
      const repTarget = exercise.rep_max;
      const effortTarget = exercise.target_rpe;
      return sets.length === exercise.sets && sets.every(item => item.completed) && progressionDecision({ allSetsReachRepTarget: repTarget !== null && sets.every(item => Number(item.reps) >= repTarget), techniqueOk: sets.every(item => item.techniqueOk), effortWithinTarget: effortTarget === null || sets.every(item => Number(item.rpe) <= effortTarget), relevantPain: sets.some(item => Number(item.pain) > 0) }) === "SUGGEST_LOAD_PROGRESSION";
    });
    if (program?.cycle_id && progressions.length) await supabase.from("training_decisions").insert({ client_id: auth.user.id, cycle_id: program.cycle_id, program_id: program.id, decision_type: "PROGRESSION_SUGGESTED", decision: `Progressão sugerida em ${progressions.length} exercício(s)`, reason: "Faixa de repetições atingida com técnica, esforço e dor dentro dos critérios.", author_type: "SYSTEM", approval_status: "pending", evidence_ids: { session_id: sessionId, workout_exercise_ids: progressions.map(item => item.id) } });
    if (sessionPain >= 4) await supabase.from("pain_reports").insert({ user_id: auth.user.id, session_id: sessionId, location: "Relato durante sessão", intensity: sessionPain, classification: sessionPain >= 8 ? "RED" : "YELLOW" });
    await supabase.from("crm_events").insert({ user_id: auth.user.id, event_type: "workout.completed", metadata: { workout_id: active.id, completion_percent: percent } });
    setDone(true);
  }

  if (entitlement.loading || loading) return <AppShell><UsageTracker module="training"/><div className="grid min-h-[70vh] place-items-center"><p className="sim-kicker">Carregando protocolo</p></div></AppShell>;
  if (!entitlement.enabled) return <AppShell><div className="mx-auto max-w-4xl px-5 py-16"><LockedFeature title="Treino orientado" description="Seu plano atual inclui o diagnóstico. O protocolo de treino é liberado nos planos com acompanhamento."/></div></AppShell>;
  if (!program) return <AppShell><div className="mx-auto max-w-5xl px-4 py-10 sm:px-5 sm:py-16"><p className="sim-kicker">Protocolo executivo</p><h1 className="mt-5 text-4xl leading-tight sm:text-5xl">Seu protocolo está sendo construído.</h1><p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">A equipe está organizando os dados recebidos antes de publicar sua direção.</p><ProtocolTimeline status={protocolStatus}/></div></AppShell>;
  if (done) return <AppShell><div className="grid min-h-[75vh] place-items-center px-5 text-center"><div className="min-w-0"><Check className="mx-auto size-10 text-primary"/><p className="sim-kicker mt-5">Execução registrada</p><h1 className="mt-4 text-4xl sm:text-5xl">Treino concluído.</h1><p className="mt-4 text-muted-foreground">Sua execução foi incorporada à carteira.</p></div></div></AppShell>;
  if (active) return <AppShell><div className="mx-auto min-w-0 max-w-4xl px-4 py-7 sm:px-5 sm:py-10"><div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div className="min-w-0"><p className="sim-kicker break-words">Sessão em andamento · {active.variant_type.replaceAll("_", " ")}</p><h1 className="mt-3 break-words text-4xl leading-tight sm:mt-4 sm:text-5xl">{active.name}</h1></div><div className="flex w-fit shrink-0 items-center gap-2 border-y border-border py-3 font-mono text-xl tabular-nums text-primary sm:text-2xl" aria-label={`Tempo de treino ${formatElapsed(elapsed)}`}><Clock3 className="size-5 shrink-0"/>{formatElapsed(elapsed)}</div></div><div className="mt-8 divide-y divide-border border-y border-border sm:mt-10">{active.workout_exercises.map(exercise => {
    const current = log[exercise.id] ?? { sets: {} };
    return <article key={exercise.id} className="min-w-0 py-7"><div className="min-w-0"><h2 className="break-words text-lg">{exercise.exercise_library?.name ?? "Exercício"}</h2><p className="mt-1 break-words text-xs text-muted-foreground">{exercise.sets} séries · {exercise.reps} reps · {exercise.rest_seconds}s · {exercise.target_effort_type} alvo {exercise.target_effort ?? exercise.target_rpe ?? "—"}</p>{exercise.exercise_library && <ExerciseDemo name={exercise.exercise_library.name} videoPath={exercise.exercise_library.video_storage_path} imagePath={exercise.exercise_library.image_storage_path} externalVideo={exercise.exercise_library.video_url} externalImage={exercise.exercise_library.image_url}/>} {exercise.reason_for_inclusion && <p className="mt-3 max-w-2xl break-words text-sm text-primary">Por que existe: {exercise.reason_for_inclusion}</p>}{exercise.pain_rule && <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground"><ShieldAlert className="mt-0.5 size-4 shrink-0"/><span className="break-words">{exercise.pain_rule}</span></p>}</div><div className="mt-5"><div className="hidden grid-cols-[52px_repeat(4,minmax(0,1fr))_76px_48px] gap-2 px-1 pb-2 text-center sm:grid"><span className="sim-kicker">Série</span>{["Carga", "Reps", "RPE", "Dor"].map(label => <span key={label} className="sim-kicker">{label}</span>)}<span className="sim-kicker">Técnica</span><span className="sim-kicker">Feita</span></div>{Array.from({ length: exercise.sets }, (_, index) => {
      const setNumber = index + 1;
      const set = current.sets[setNumber] ?? emptySet();
      return <div key={setNumber} className="grid min-w-0 grid-cols-2 gap-3 border-t border-border/60 py-4 sm:grid-cols-[52px_repeat(4,minmax(0,1fr))_76px_48px] sm:items-center sm:gap-2 sm:py-2"><span className="col-span-2 font-mono text-xs text-muted-foreground sm:col-span-1 sm:text-center sm:text-sm">Série {setNumber}</span>{(["load", "reps", "rpe", "pain"] as const).map(key => <label key={key} className="min-w-0"><span className="mb-1 block text-[8px] uppercase text-muted-foreground sm:hidden">{{load:"Carga",reps:"Reps",rpe:"RPE",pain:"Dor"}[key]}</span><Input className="min-w-0" aria-label={`${exercise.exercise_library?.name ?? "Exercício"} série ${setNumber} ${key}`} type="number" min={key === "pain" ? 0 : undefined} max={key === "pain" ? 10 : undefined} value={set[key]} onChange={event => void updateSet(exercise, setNumber, { [key]: event.target.value })}/></label>)}<div className="flex min-w-0 items-center gap-2 sm:contents"><Button className="flex-1 sm:flex-none" size="icon" variant={set.techniqueOk ? "quiet" : "gold"} aria-label={`Técnica da série ${setNumber}`} onClick={() => void updateSet(exercise, setNumber, { techniqueOk: !set.techniqueOk })}><ShieldAlert/></Button><span className="text-[9px] uppercase text-muted-foreground sm:hidden">Técnica</span></div><div className="flex min-w-0 items-center justify-end gap-2 sm:contents"><span className="text-[9px] uppercase text-muted-foreground sm:hidden">Feita</span><Button size="icon" variant={set.completed ? "gold" : "quiet"} aria-label={`Concluir série ${setNumber}`} onClick={() => void updateSet(exercise, setNumber, { completed: !set.completed })}><Check/></Button></div></div>;
    })}</div><label className="mt-4 inline-flex max-w-full cursor-pointer items-center border border-border px-4 py-2 text-xs">Enviar vídeo técnico<input className="hidden" type="file" accept="video/*" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadTechnique(exercise, file); }}/></label></article>;
  })}</div><div className="mt-8 grid gap-3 sm:grid-cols-2"><Input type="number" min={1} max={10} value={sessionRpe} onChange={event => setSessionRpe(event.target.value)} placeholder="RPE da sessão"/><Input value={comment} onChange={event => setComment(event.target.value)} placeholder="Comentário para a equipe"/></div><Button variant="gold" className="mt-4 h-12 w-full" onClick={() => void finish()}>Concluir treino</Button></div></AppShell>;
  return <AppShell><div className="mx-auto min-w-0 max-w-5xl px-4 py-7 sm:px-5 sm:py-10"><p className="sim-kicker">O que eu preciso fazer hoje?</p><h1 className="mt-3 break-words text-4xl leading-tight sm:mt-4 sm:text-5xl">{program.title}</h1><p className="mt-3 max-w-2xl break-words text-sm text-muted-foreground sm:text-base">{program.why_this_plan ?? program.objective ?? "Direção publicada pela equipe."}</p><div className="mt-6 grid gap-2 border-y border-border py-4 text-xs uppercase text-muted-foreground min-[480px]:grid-cols-[auto_auto_auto] min-[480px]:justify-start min-[480px]:gap-4"><span>Treino publicado</span><Link to="/weekly-review" className="text-primary">Check-in semanal</Link><Link to="/training/assessment" className="text-primary">Protocolo fotográfico</Link></div><div className="mt-8 space-y-4 sm:mt-10">{[...program.workouts].sort((a, b) => a.name.localeCompare(b.name)).map(workout => <article key={workout.id} className="sim-panel grid min-w-0 gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6"><div className="min-w-0"><p className="sim-kicker break-words">{workout.variant_type.replaceAll("_", " ")}</p><h2 className="mt-2 break-words text-3xl">{workout.name}</h2><p className="mt-2 break-words text-xs text-muted-foreground">{workout.workout_exercises.length} exercícios{workout.estimated_minutes ? ` · ${workout.estimated_minutes} minutos estimados` : ""}</p></div><Button className="w-full sm:w-auto" variant="gold" onClick={() => void start(workout)}><Play/> Iniciar treino</Button></article>)}</div><div className="mt-12"><TeamConversation contextType="training" contextId={program.id}/></div></div></AppShell>;
}
