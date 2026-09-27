import { useEffect, useState } from "react";
import { createFileRoute,Link } from "@tanstack/react-router";
import { Activity, Check, Clock3, Dumbbell, Play, ShieldAlert, TimerReset } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/sim/AppShell";import{UsageTracker}from"@/components/sim/UsageTracker";
import { LockedFeature } from "@/components/sim/LockedFeature";
import { ProtocolTimeline } from "@/components/sim/ProtocolTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useEntitlement } from "@/hooks/use-entitlement";
import { progressionDecision } from "@/lib/training-rules";
import { ExerciseDemo } from "@/components/sim/ExerciseDemo";
import { TeamConversation } from "@/components/sim/TeamConversation";

export const Route = createFileRoute("/_authenticated/training")({ head: () => ({ meta: [{ title: "Treino — SIM OS" }, { name: "description", content: "Seu protocolo de construção e capacidade." }, { property: "og:title", content: "Treino — SIM OS" }, { property: "og:description", content: "Execute seu protocolo com clareza." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Page });
type Exercise = { id: string; sets: number; reps: string; rep_min:number|null; rep_max:number|null; initial_load: number | null; rest_seconds: number; target_effort_type:string; target_effort:number|null; target_rpe: number | null; notes: string | null; execution_notes:string|null; reason_for_inclusion:string|null; pain_rule:string|null; sequence: number; exercise_library: { id:string; name: string; muscle_group: string; video_storage_path:string|null; image_storage_path:string|null; video_url:string|null; image_url:string|null } | null };
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
  const [restUntil, setRestUntil] = useState<number | null>(null);
  const [restRemaining, setRestRemaining] = useState(0);
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
        supabase.from("workout_programs").select("id,cycle_id,title,objective,why_this_plan,workouts(id,name,estimated_minutes,notes,sequence,variant_type,workout_exercises(id,sets,reps,rep_min,rep_max,initial_load,rest_seconds,target_rpe,target_effort_type,target_effort,notes,execution_notes,reason_for_inclusion,pain_rule,sequence,exercise_library(id,name,muscle_group,video_storage_path,image_storage_path,video_url,image_url)))").eq("user_id", auth.user.id).eq("status", "published").order("published_at", { ascending: false }).limit(1).maybeSingle(),
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

  useEffect(() => {
    if (!restUntil) { setRestRemaining(0); return; }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((restUntil - Date.now()) / 1000));
      setRestRemaining(remaining);
      if (remaining === 0) setRestUntil(null);
    };
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [restUntil]);

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
    if (patch.completed === true && !currentSet.completed && exercise.rest_seconds > 0) setRestUntil(Date.now() + exercise.rest_seconds * 1000);
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
  const activeTotalSets = active?.workout_exercises.reduce((sum, exercise) => sum + exercise.sets, 0) ?? 0;
  const activeCompletedSets = active?.workout_exercises.reduce((sum, exercise) => sum + Array.from({ length: exercise.sets }, (_, index) => log[exercise.id]?.sets[index + 1]?.completed).filter(Boolean).length, 0) ?? 0;
  const activeProgress = activeTotalSets ? Math.round(activeCompletedSets / activeTotalSets * 100) : 0;
  if (active) return (
    <AppShell>
      <UsageTracker module="training"/>
      <div className="mx-auto min-w-0 max-w-4xl px-4 py-7 sm:px-6 sm:py-12">
        <header className="sticky top-0 z-20 -mx-4 mb-8 bg-background/95 px-4 pb-6 pt-2 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="sim-kicker inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                Sessão em andamento · {activeCompletedSets}/{activeTotalSets} séries
              </p>
              <h1 className="mt-2 text-3xl leading-tight font-display sm:text-5xl">{active.name}</h1>
            </div>
            <div className="flex items-center gap-4 border border-border bg-card/50 p-3 sm:p-4" aria-label={`Tempo de treino ${formatElapsed(elapsed)}`}>
              <div><span className="block text-[8px] uppercase text-muted-foreground">Tempo total</span><span className="mt-1 flex items-center gap-2 font-mono text-xl tabular-nums text-primary sm:text-2xl"><Clock3 className="size-4 shrink-0" />{formatElapsed(elapsed)}</span></div>
              {restRemaining > 0 && <button className="border-l border-primary pl-4 text-left" onClick={() => setRestUntil(null)} aria-label="Encerrar descanso"><span className="block text-[8px] uppercase text-primary">Descanso</span><span className="mt-1 flex items-center gap-2 font-mono text-xl tabular-nums"><TimerReset className="size-4 text-primary"/>{formatElapsed(restRemaining).slice(3)}</span></button>}
            </div>
          </div>
          <Progress className="mt-4 h-1 rounded-none bg-muted" value={activeProgress}/>
        </header>

        <div className="space-y-8 sm:space-y-12">
          {active.workout_exercises.map((exercise, exerciseIndex) => {
            const current = log[exercise.id] ?? { sets: {} };
            const completedHere = Array.from({ length: exercise.sets }, (_, index) => current.sets[index + 1]?.completed).filter(Boolean).length;
            const priorIncomplete = active.workout_exercises.slice(0, exerciseIndex).some(previous => Array.from({ length: previous.sets }, (_, index) => !log[previous.id]?.sets[index + 1]?.completed).some(Boolean));
            const isCurrent = completedHere < exercise.sets && !priorIncomplete;
            return (
              <article key={exercise.id} className={`sim-panel overflow-hidden transition-colors ${isCurrent ? "border-primary/70" : "border-primary/10"}`}>
                <div className="p-5 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3"><span className="grid size-8 place-items-center border border-border font-mono text-[10px] text-primary">{completedHere === exercise.sets ? <Check className="size-4"/> : String(exerciseIndex + 1).padStart(2, "0")}</span><h2 className="text-xl font-display sm:text-2xl">{exercise.exercise_library?.name ?? "Exercício"}</h2>{isCurrent && <span className="border border-primary px-2 py-1 text-[8px] uppercase text-primary">Agora</span>}</div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded border border-border/50"><Check className="size-3 text-primary"/> {exercise.sets} séries</span>
                        <span className="bg-muted/30 px-2 py-0.5 rounded border border-border/50 font-medium text-foreground/80">{exercise.reps} reps</span>
                        <span className="bg-muted/30 px-2 py-0.5 rounded border border-border/50 italic">{exercise.rest_seconds}s rest</span>
                        <span className="text-primary font-bold uppercase tracking-wider">{exercise.target_effort_type} {exercise.target_effort ?? exercise.target_rpe ?? "—"}</span>
                      </div>
                      {exercise.reason_for_inclusion && (
                        <p className="mt-4 border-l-2 border-primary/30 pl-3 text-sm italic text-muted-foreground/90">
                          {exercise.reason_for_inclusion}
                        </p>
                      )}
                      {exercise.execution_notes && <p className="mt-3 text-sm text-foreground/80">{exercise.execution_notes}</p>}
                      {exercise.notes && <p className="mt-2 text-xs text-muted-foreground">{exercise.notes}</p>}
                      {exercise.pain_rule && (
                        <p className="mt-3 flex items-start gap-2 text-xs text-destructive/80">
                          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                          <span>{exercise.pain_rule}</span>
                        </p>
                      )}
                    </div>
                    {exercise.exercise_library && (
                      <div className="shrink-0">
                        <ExerciseDemo 
                          name={exercise.exercise_library.name} 
                          videoPath={exercise.exercise_library.video_storage_path} 
                          imagePath={exercise.exercise_library.image_storage_path} 
                          externalVideo={exercise.exercise_library.video_url} 
                          externalImage={exercise.exercise_library.image_url} 
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <div className="hidden grid-cols-[60px_1fr_1fr_1fr_1fr_80px_60px] gap-3 px-2 pb-3 text-center sm:grid">
                      <span className="sim-kicker">Série</span>
                      {["Carga", "Reps", "RPE", "Dor"].map(label => <span key={label} className="sim-kicker">{label}</span>)}
                      <span className="sim-kicker">Status</span>
                      <span className="sim-kicker">Check</span>
                    </div>
                    
                    <div className="divide-y divide-border/40">
                      {Array.from({ length: exercise.sets }, (_, index) => {
                        const setNumber = index + 1;
                        const set = current.sets[setNumber] ?? emptySet();
                        const isDone = set.completed;
                        
                        return (
                          <div key={setNumber} className={`grid grid-cols-2 gap-4 py-5 sm:grid-cols-[60px_1fr_1fr_1fr_1fr_80px_60px] sm:items-center sm:gap-3 sm:py-2.5 transition-all duration-300 ${isDone ? "bg-primary/5 -mx-2 px-2" : ""}`}>
                            <span className="col-span-2 font-mono text-[10px] text-muted-foreground sm:col-span-1 sm:text-center sm:text-sm">
                              #{setNumber}
                            </span>
                            {(["load", "reps", "rpe", "pain"] as const).map(key => (
                              <label key={key} className="flex flex-col gap-1.5 sm:block">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 sm:hidden">
                                  {{load:"Carga (kg)",reps:"Reps",rpe:"RPE",pain:"Dor"}[key]}
                                </span>
                                <Input 
                                  className={`sim-training-input h-10 text-center text-base sm:h-9 sm:text-sm ${isDone ? "opacity-60 grayscale-[0.5]" : ""}`}
                                  aria-label={`${exercise.exercise_library?.name ?? "Exercício"} série ${setNumber} ${key}`} 
                                  type="number" 
                                  min={key === "pain" ? 0 : undefined} 
                                  max={key === "pain" ? 10 : undefined} 
                                  value={set[key]} 
                                  onChange={event => void updateSet(exercise, setNumber, { [key]: event.target.value })} 
                                />
                              </label>
                            ))}
                            <div className="flex items-center gap-3 sm:justify-center">
                              <Button 
                                className={`flex-1 sm:flex-none transition-all duration-300 ${!set.techniqueOk ? "bg-destructive/20 text-destructive hover:bg-destructive/30" : "text-muted-foreground/30 hover:text-destructive/50"}`}
                                size="sm" 
                                variant="ghost"
                                onClick={() => void updateSet(exercise, setNumber, { techniqueOk: !set.techniqueOk })}
                                aria-label="Alerta de técnica"
                              >
                                <ShieldAlert className="size-4" />
                                <span className="ml-2 text-[10px] uppercase font-bold sm:hidden">Técnica</span>
                              </Button>
                            </div>
                            <div className="flex items-center justify-end sm:justify-center">
                              <Button 
                                size="sm" 
                                variant={isDone ? "gold" : "outline"}
                                className={`h-10 w-full sm:h-8 sm:w-8 sm:rounded-full transition-all duration-500 ${isDone ? "shadow-lg shadow-primary/20 scale-105" : "border-muted-foreground/20 text-muted-foreground/40"}`}
                                onClick={() => void updateSet(exercise, setNumber, { completed: !isDone })}
                              >
                                <Check className={`size-4 ${isDone ? "scale-110" : "opacity-30"}`} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <label className="group relative flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:border-primary/50 hover:text-primary hover:bg-primary/5 overflow-hidden">
                      <Dumbbell className="relative z-10 size-4 text-primary"/><span className="relative z-10">Enviar vídeo técnico</span>
                      <div className="absolute inset-0 translate-y-full bg-primary/5 transition-transform group-hover:translate-y-0" />
                      <input className="hidden" type="file" accept="video/*" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadTechnique(exercise, file); }}/>
                    </label>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="mt-12 space-y-6 rounded-2xl border border-primary/20 bg-card/40 p-6 backdrop-blur-md sm:p-10 shadow-2xl">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="sim-kicker ml-1 block text-primary/80">Esforço Total da Sessão (RPE 1-10)</label>
              <Input 
                type="number" min={1} max={10} 
                value={sessionRpe} 
                onChange={event => setSessionRpe(event.target.value)} 
                placeholder="Ex: 8"
                className="sim-training-input h-14 text-xl font-display"
              />
            </div>
            <div className="space-y-3">
              <label className="sim-kicker ml-1 block text-primary/80">Observações Estratégicas</label>
              <Input 
                value={comment} 
                onChange={event => setComment(event.target.value)} 
                placeholder="Ex: Senti fadiga no 3º bloco..."
                className="sim-training-input h-14 italic"
              />
            </div>
          </div>
          <Button variant="gold" className="group relative h-16 w-full overflow-hidden text-lg font-bold tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]" onClick={() => void finish()}>
            <div className="absolute inset-0 -translate-x-full bg-white/10 transition-transform group-hover:translate-x-full duration-1000 skew-x-[-20deg]" />
            CONCLUIR E SINCRONIZAR TREINO
          </Button>
        </footer>
      </div>
    </AppShell>
  );
  return (
    <AppShell>
      <UsageTracker module="training"/>
      <div className="mx-auto min-w-0 max-w-5xl px-4 py-10 sm:px-8 sm:py-20">
        <header className="relative mb-10 sm:mb-14">
          <div className="absolute -left-4 top-0 h-full w-1 bg-primary/40 hidden sm:block" />
          <p className="sim-kicker mb-4 inline-flex items-center gap-2"><Activity className="size-4"/> Protocolo ativo</p>
          <h1 className="text-4xl leading-tight font-display sm:text-6xl">{program.title}</h1>
          <p className="mt-6 max-w-3xl border-l border-primary/30 py-1 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {program.why_this_plan ?? program.objective ?? "Direção estratégica publicada pela equipe técnica SIM."}
          </p>
          
          <nav className="mt-8 flex flex-wrap gap-5 text-[10px] font-bold uppercase">
            <span className="flex items-center gap-2.5 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"/> 
              Status: Ativo
            </span>
            <Link to="/weekly-review" className="text-muted-foreground/60 transition-all hover:text-primary hover:tracking-[0.3em] underline decoration-primary/20 underline-offset-8">Check-in semanal</Link>
            <Link to="/training/assessment" className="text-muted-foreground/60 transition-all hover:text-primary hover:tracking-[0.3em] underline decoration-primary/20 underline-offset-8">Protocolo fotográfico</Link>
          </nav>
        </header>

        <div className="grid grid-cols-3 border-y border-border py-4 text-center"><div><strong className="block font-mono text-xl text-primary">{program.workouts.length}</strong><span className="text-[8px] uppercase text-muted-foreground">Sessões</span></div><div className="border-x border-border"><strong className="block font-mono text-xl">{program.workouts.reduce((sum, workout) => sum + workout.workout_exercises.reduce((sets, exercise) => sets + exercise.sets, 0), 0)}</strong><span className="text-[8px] uppercase text-muted-foreground">Séries</span></div><div><strong className="block font-mono text-xl">{program.workouts.reduce((sum, workout) => sum + (workout.estimated_minutes ?? 0), 0)}</strong><span className="text-[8px] uppercase text-muted-foreground">Min previstos</span></div></div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {[...program.workouts].sort((a, b) => a.name.localeCompare(b.name)).map((workout, index) => (
            <article key={workout.id} className="sim-panel sim-workout-card group relative grid min-w-0 gap-5 overflow-hidden p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6 transition-colors border-primary/5 hover:border-primary/40">
              <div className="absolute -right-12 top-0 h-full w-48 translate-x-12 skew-x-[-25deg] bg-primary/[0.02] transition-all group-hover:bg-primary/[0.05] group-hover:translate-x-0" />
              
              <div className="relative z-10 grid size-11 place-items-center border border-border font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</div><div className="relative z-10 min-w-0">
                <p className="sim-kicker text-primary/50 group-hover:text-primary/80 transition-colors">{workout.variant_type.replaceAll("_", " ")}</p>
                 <h2 className="mt-2 text-2xl font-display leading-tight">{workout.name.replace(/^DIA \d+ — /, "")}</h2>
                 <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground/70">
                  <span className="flex items-center gap-2"><Check className="size-3.5 text-primary/40"/> {workout.workout_exercises.length} movimentos</span>
                  {workout.estimated_minutes && (
                    <span className="flex items-center gap-2"><Clock3 className="size-3.5 text-primary/40"/> ~{workout.estimated_minutes} min</span>
                  )}
                </div>
              </div>
              
              <div className="relative z-10">
                <Button 
                  className="group/btn h-11 w-full gap-3 px-4 text-xs font-bold sm:w-11" 
                  size="icon"
                  variant="gold" 
                  onClick={() => void start(workout)}
                >
                   <Play className="size-4 fill-current" />
                   <span className="sm:hidden">INICIAR SESSÃO</span>
                </Button>
              </div>
            </article>
          ))}
        </div>
        
        <div className="mt-32 border-t border-primary/5 pt-16">
          <div className="max-w-2xl">
            <h3 className="sim-kicker mb-6">Suporte Estratégico</h3>
            <TeamConversation contextType="training" contextId={program.id}/>
          </div>
        </div>
      </div>
    </AppShell>
  );
}