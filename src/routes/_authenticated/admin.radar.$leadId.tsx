import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/sim/AppShell";
import { RadarWebChart } from "@/components/sim/RadarWebChart";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { requireStaff } from "@/lib/admin-guard";
import { getRadarLead360, updateRadarLeadStatus } from "@/lib/radar.functions";
import { pillarLabels, type PillarKey } from "@/lib/sim-score";

export const Route = createFileRoute("/_authenticated/admin/radar/$leadId")({
  beforeLoad: requireStaff,
  head: () => ({ meta: [
    { title: "Lead 360 — Radar da Performance" },
    { name: "description", content: "Contexto, respostas, análise e histórico de um lead do Radar." },
    { property: "og:title", content: "Lead 360 — Radar da Performance" },
    { property: "og:description", content: "Visão operacional individual do Radar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const statuses = ["NEW", "RADAR_STARTED", "RADAR_COMPLETED", "WHATSAPP_CLICKED", "QUALIFIED", "OPPORTUNITY", "CLIENT", "DISQUALIFIED"];
const statusLabels: Record<string, string> = { NEW: "Novo", RADAR_STARTED: "Iniciou", RADAR_COMPLETED: "Concluiu", WHATSAPP_CLICKED: "WhatsApp", QUALIFIED: "Qualificado", OPPORTUNITY: "Oportunidade", CLIENT: "Cliente", DISQUALIFIED: "Desqualificado" };
function one<T>(value: T | T[] | null | undefined): T | null { return Array.isArray(value) ? value[0] ?? null : value ?? null; }

function Page() {
  const { leadId } = Route.useParams();
  const load = useServerFn(getRadarLead360);
  const update = useServerFn(updateRadarLeadStatus);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await load({ data: { leadId } })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível abrir esta ficha."); }
    finally { setLoading(false); }
  }, [leadId, load]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function change(status: string) {
    try { await update({ data: { leadId, status: status as any } }); toast.success("Status atualizado."); await refresh(); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Não foi possível atualizar."); }
  }

  const answers = useMemo(() => (data?.answers ?? []).map((answer: any) => ({ ...answer, question: one(answer.radar_questions) })).sort((a: any, b: any) => (a.question?.position ?? 0) - (b.question?.position ?? 0)), [data]);

  if (loading) return <AppShell admin><div className="p-10"><p className="sim-kicker">Abrindo Lead 360</p></div></AppShell>;
  if (error || !data?.lead) return <AppShell admin><div className="mx-auto max-w-xl px-5 py-16"><p className="sim-kicker">Lead 360</p><h1 className="mt-4 text-4xl">Não foi possível abrir a ficha</h1><p className="mt-4 text-sm text-muted-foreground">{error}</p><Button className="mt-7" onClick={() => void refresh()}><RefreshCw />Tentar novamente</Button></div></AppShell>;

  const { lead, score, analysis } = data;
  const scores = score ? Object.fromEntries((Object.keys(pillarLabels) as PillarKey[]).map((key) => [key, score[`${key}_score`]])) as Record<PillarKey, number> : null;

  return <AppShell admin><div className="mx-auto max-w-6xl px-5 py-9">
    <Link to="/admin/radar" className="inline-flex items-center gap-2 text-xs uppercase text-primary"><ArrowLeft className="size-4" />Radar & Leads</Link>
    <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="sim-kicker">Lead 360</p><h1 className="mt-3 text-5xl">{lead.full_name}</h1><p className="mt-3 text-sm text-muted-foreground">{[lead.job_title, lead.company, lead.segment].filter(Boolean).join(" · ")}</p></div>
      <Select value={lead.commercial_status} onValueChange={(value) => void change(value)}><SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger><SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{statusLabels[item]}</SelectItem>)}</SelectContent></Select>
    </div>
    <section className="mt-8 grid gap-px border border-border bg-border md:grid-cols-4">{[["E-mail", lead.email], ["WhatsApp", lead.whatsapp], ["Progresso", `${lead.completion_percentage}%`], ["Score", score?.sim_performance_score ?? "—"]].map(([label, value]) => <div key={String(label)} className="min-w-0 bg-background p-5"><p className="sim-kicker">{label}</p><p className="mt-3 break-words text-sm">{value}</p></div>)}</section>
    {scores && <section className="mt-10 grid gap-10 border-y border-border py-8 lg:grid-cols-2"><RadarWebChart scores={scores} /><div><p className="sim-kicker">Leitura executiva</p><h2 className="mt-4 text-4xl">{analysis?.current_state ?? "Análise em processamento"}</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">{analysis?.executive_summary}</p>{analysis && <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2"><div><p className="sim-kicker">Ativo</p><p className="mt-2">{analysis.primary_strength?.title}</p></div><div><p className="sim-kicker">Gargalo</p><p className="mt-2">{analysis.primary_bottleneck?.title}</p></div></div>}</div></section>}
    <section className="mt-12"><div className="flex items-end justify-between gap-4"><div><p className="sim-kicker">Respostas</p><h2 className="mt-3 text-3xl">Avaliação completa</h2></div><span className="text-sm text-muted-foreground">{answers.length} respostas</span></div>
      {answers.length ? <div className="mt-5 divide-y divide-border border-y border-border">{answers.map((answer: any) => <div key={answer.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><span className="text-sm">{answer.question?.prompt ?? "Pergunta indisponível"}</span><strong className="font-display text-2xl text-primary">{answer.answer_value}/5</strong></div>)}</div> : <div className="mt-5 border-y border-border py-10 text-sm text-muted-foreground">Este lead ainda não respondeu às perguntas do Radar.</div>}
    </section>
    <section className="mt-12"><p className="sim-kicker">Timeline</p><div className="mt-5 divide-y divide-border border-y border-border">{data.events.length ? data.events.map((event: any) => <div key={event.id} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto]"><span className="text-xs uppercase">{event.event_type.replaceAll("_", " ")}</span><span className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(event.created_at))}</span></div>) : <p className="py-8 text-sm text-muted-foreground">Nenhum evento registrado.</p>}</div></section>
  </div></AppShell>;
}