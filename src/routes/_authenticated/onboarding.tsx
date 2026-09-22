import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calculateSimScore, type PillarKey, type ScoreAnswers } from "@/lib/sim-score";
import { Brand } from "@/components/sim/Brand";
import { CinematicBackdrop } from "@/components/sim/CinematicBackdrop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useServerFn } from "@tanstack/react-start";
import { completeClientAnamnesis } from "@/lib/anamnesis.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Calibração inicial — Shape Is Money" }, { name: "description", content: "Calibre sua jornada de performance executiva." }, { property: "og:title", content: "Calibração inicial — Shape Is Money" }, { property: "og:description", content: "Entenda a vida que seu corpo precisa sustentar." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Page,
});

type Answers = Record<string, string | number | boolean>;
type ContextStep = { type: "context"; key: string; kicker: string; title: string; fields: { key: string; label: string; type?: "text" | "number" | "date" | "textarea" }[] };
type ScoreStep = { type: "score"; key: `${PillarKey}_${1 | 2 | 3}`; kicker: string; title: string; low: string; high: string };
type Step = ContextStep | ScoreStep;

const steps: Step[] = [
  { type: "context", key: "identity", kicker: "Contexto / Identidade", title: "Quem sustenta essa rotina?", fields: [{ key: "first_name", label: "Nome" }, { key: "birth_date", label: "Data de nascimento", type: "date" }, { key: "height_cm", label: "Altura em cm", type: "number" }, { key: "weight_kg", label: "Peso em kg", type: "number" }] },
  { type: "context", key: "work", kicker: "Contexto / Responsabilidade", title: "O que sua vida exige hoje?", fields: [{ key: "profession", label: "Profissão" }, { key: "company", label: "Empresa" }, { key: "job_title", label: "Cargo" }, { key: "responsibility", label: "Nível de responsabilidade" }] },
  { type: "context", key: "training_context", kicker: "Contexto / Estrutura", title: "Qual rotina você consegue sustentar?", fields: [{ key: "main_goal", label: "Objetivo principal" }, { key: "training_history", label: "Histórico de treinamento" }, { key: "desired_training_days", label: "Dias que deseja treinar", type: "number" }, { key: "sustainable_training_days", label: "Dias que realmente sustenta", type: "number" }, { key: "session_minutes", label: "Minutos disponíveis por sessão", type: "number" }] },
  { type: "context", key: "constraints", kicker: "Contexto / Direção", title: "O que precisa ser considerado?", fields: [{ key: "difficulties", label: "Principais dificuldades", type: "textarea" }, { key: "has_discomfort", label: "Possui desconfortos corporais autorrelatados?" }, { key: "discomfort_region", label: "Região do desconforto, se houver" }, { key: "goal_90_days", label: "Objetivo para os próximos 90 dias", type: "textarea" }] },
  { type: "score", key: "construction_1", kicker: "Construção / 01", title: "Quanto seu físico atual representa o físico que você deseja construir?", low: "Ainda não representa", high: "Representa plenamente" },
  { type: "score", key: "construction_2", kicker: "Construção / 02", title: "Como você avalia sua evolução física nos últimos meses?", low: "Sem evolução", high: "Evolução consistente" },
  { type: "score", key: "construction_3", kicker: "Construção / 03", title: "Qual é seu nível atual de consistência com treinamento?", low: "Muito baixo", high: "Muito alto" },
  { type: "score", key: "capacity_1", kicker: "Capacidade / 01", title: "Como você avalia a qualidade do seu sono?", low: "Muito baixa", high: "Excelente" },
  { type: "score", key: "capacity_2", kicker: "Capacidade / 02", title: "Como você avalia sua energia durante o horário de trabalho?", low: "Muito baixa", high: "Excelente" },
  { type: "score", key: "capacity_3", kicker: "Capacidade / 03", title: "Quanto dores ou desconfortos corporais interferem na sua rotina?", low: "Não interferem", high: "Interferem muito" },
  { type: "score", key: "governance_1", kicker: "Governo / 01", title: "Quanto controle você sente que possui sobre sua própria agenda?", low: "Pouco controle", high: "Controle completo" },
  { type: "score", key: "governance_2", kicker: "Governo / 02", title: "Quão consistente é sua rotina de alimentação e hidratação?", low: "Inconsistente", high: "Muito consistente" },
  { type: "score", key: "governance_3", kicker: "Governo / 03", title: "Com que frequência você cumpre os compromissos que estabelece consigo mesmo?", low: "Raramente", high: "Sempre" },
  { type: "score", key: "perception_1", kicker: "Percepção / 01", title: "Quanto sua postura transmite a confiança que você deseja comunicar?", low: "Pouco", high: "Plenamente" },
  { type: "score", key: "perception_2", kicker: "Percepção / 02", title: "Quanto sua imagem atual representa o nível profissional que você alcançou?", low: "Pouco", high: "Plenamente" },
  { type: "score", key: "perception_3", kicker: "Percepção / 03", title: "Quão confiante você se sente ao entrar em ambientes importantes?", low: "Pouco confiante", high: "Muito confiante" },
  { type: "score", key: "execution_1", kicker: "Execução / 01", title: "Quanto daquilo que você planeja você realmente executa?", low: "Muito pouco", high: "Quase tudo" },
  { type: "score", key: "execution_2", kicker: "Execução / 02", title: "Qual sua capacidade de agir mesmo quando não está motivado?", low: "Muito baixa", high: "Muito alta" },
  { type: "score", key: "execution_3", kicker: "Execução / 03", title: "Como você avalia sua consistência nos últimos 30 dias?", low: "Muito baixa", high: "Muito alta" },
];

function Page() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [scoreValue, setScoreValue] = useState(3);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const completeAnamnesis = useServerFn(completeClientAnamnesis);
  const step = steps[index];

  useEffect(() => { void (async () => {
    const { data: userData } = await supabase.auth.getUser(); if (!userData.user) return;
    const { data } = await supabase.from("onboarding_responses").select("responses,current_step,completed_at").eq("user_id", userData.user.id).maybeSingle();
    if (!data || data.completed_at) return;
    const restored = data.responses && typeof data.responses === "object" && !Array.isArray(data.responses) ? data.responses as Answers : {};
    setAnswers(restored); setIndex(Math.min(data.current_step, steps.length - 1)); setStarted(data.current_step > 0);
  })(); }, []);

  useEffect(() => { if (step?.type === "score") setScoreValue(Number(answers[step.key] ?? 3)); }, [step, answers]);
  if (!step) return null;

  async function persist(nextAnswers: Answers, nextStep: number, completedAt?: string) {
    const { data: userData } = await supabase.auth.getUser(); if (!userData.user) throw new Error("Sessão não encontrada");
    const profileData = { first_name: String(nextAnswers['first_name'] ?? ""), birth_date: String(nextAnswers['birth_date'] || "") || null, height_cm: Number(nextAnswers['height_cm']) || null, weight_kg: Number(nextAnswers['weight_kg']) || null, profession: String(nextAnswers['profession'] || "") || null, company: String(nextAnswers['company'] || "") || null, job_title: String(nextAnswers['job_title'] || "") || null };
    const [{ error }] = await Promise.all([supabase.from("onboarding_responses").upsert({ user_id: userData.user.id, responses: nextAnswers, current_step: nextStep, completed_at: completedAt ?? null }, { onConflict: "user_id" }), supabase.from("profiles").update(profileData).eq("id", userData.user.id)]);
    if (error) throw error; return userData.user.id;
  }

  async function advance() {
    setSaving(true);
    try {
      const currentStep = steps[index]; if (!currentStep) return;
      const nextAnswers = currentStep.type === "score" ? { ...answers, [currentStep.key]: scoreValue } : answers;
      setAnswers(nextAnswers);
      if (index < steps.length - 1) { await persist(nextAnswers, index + 1); setIndex(index + 1); return; }
      await persist(nextAnswers, steps.length, new Date().toISOString());
      await completeAnamnesis({ data: { answers: nextAnswers } });
      await navigate({ to: "/diagnosis" });
    } finally { setSaving(false); }
  }

  if (!started) return <main className="relative flex min-h-screen flex-col justify-between overflow-hidden px-5 py-7 sm:px-10 lg:px-14"><CinematicBackdrop/><div className="relative z-10 flex items-start justify-between"><Brand compact/><p className="text-[9px] uppercase tracking-[0.26em] text-foreground/50">Calibration / 00</p></div><section className="sim-reveal relative z-10 max-w-3xl"><p className="sim-kicker">Diagnóstico inicial</p><h1 className="mt-7 text-6xl leading-[.96] sm:text-8xl">Antes da direção,<br/>precisão.</h1><p className="mt-7 max-w-xl text-base leading-7 text-foreground/65">Contexto executivo e cinco pilares. Suas respostas são salvas a cada etapa.</p><Button variant="gold" className="mt-10 h-12 px-8" onClick={() => setStarted(true)}>Iniciar calibração <ArrowRight/></Button></section><p className="relative z-10 text-[9px] uppercase tracking-[0.24em] text-foreground/45">Sem diagnóstico médico · Dados privados</p></main>;

  return <main className="relative flex min-h-screen flex-col overflow-hidden px-5 py-7 sm:px-10 lg:px-14"><div className="sim-grain pointer-events-none absolute inset-0"/><div className="relative z-10 flex items-start justify-between"><Brand compact/><div className="text-right"><p className="text-[9px] uppercase tracking-[0.26em] text-muted-foreground">Calibration / {String(index + 1).padStart(2, "0")}</p><p className="mt-2 font-display text-2xl text-primary">{index + 1} / {steps.length}</p></div></div><div className="relative z-10 mt-8 h-px bg-muted"><div className="h-px bg-primary transition-all duration-700" style={{ width: `${((index + 1) / steps.length) * 100}%` }}/></div><section className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-12"><p className="sim-kicker">{step.kicker}</p><h1 className="mt-7 max-w-3xl text-5xl leading-[1.02] sm:text-7xl">{step.title}</h1>{step.type === "score" ? <div className="mt-14 max-w-2xl"><div className="mb-6 flex items-end justify-between gap-6 text-[9px] uppercase tracking-[0.16em] text-muted-foreground"><span>1 · {step.low}</span><strong className="font-display text-5xl text-primary">{scoreValue}</strong><span className="text-right">5 · {step.high}</span></div><Slider value={[scoreValue]} onValueChange={(values) => setScoreValue(values[0] ?? 3)} min={1} max={5} step={1}/></div> : <div className="mt-10 grid gap-5 sm:grid-cols-2">{step.fields.map((field) => <label key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}><span className="mb-2 block text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{field.label}</span>{field.type === "textarea" ? <Textarea className="min-h-28 rounded-none" value={String(answers[field.key] ?? "")} onChange={(event) => setAnswers({ ...answers, [field.key]: event.target.value })}/> : <Input type={field.type ?? "text"} value={String(answers[field.key] ?? "")} onChange={(event) => setAnswers({ ...answers, [field.key]: event.target.value })}/>}</label>)}</div>}<div className="mt-12 flex items-center justify-between"><Button variant="ghost" disabled={index === 0 || saving} onClick={() => setIndex(Math.max(0, index - 1))}><ArrowLeft/> Voltar</Button><Button variant="gold" className="h-12 px-8" disabled={saving} onClick={advance}>{saving ? "Salvando" : index === steps.length - 1 ? "Estabelecer baseline" : "Continuar"}<ArrowRight/></Button></div></section></main>;
}