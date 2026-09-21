import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Clock3, Dumbbell, FileClock, ShieldAlert } from "lucide-react";
import { requireStaff } from "@/lib/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/sim/AppShell";
import { classifyAttention } from "@/lib/training-rules";

export const Route = createFileRoute("/_authenticated/admin/training/")({ beforeLoad: requireStaff, head:()=>({meta:[{title:"Training Intelligence — Administração SIM"},{name:"description",content:"Decisões, prescrições e atenção operacional."},{property:"og:title",content:"Training Intelligence — Administração SIM"},{property:"og:description",content:"Cockpit oficial de decisões de treino."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}), component: Page });

function Page(){
  const [rows,setRows]=useState<any[]>([]); const [programs,setPrograms]=useState<any[]>([]); const [reviews,setReviews]=useState<any[]>([]); const [sessions,setSessions]=useState<any[]>([]); const [decisions,setDecisions]=useState<any[]>([]);
  useEffect(()=>{void(async()=>{const [p,pr,r,s,d]=await Promise.all([supabase.from("profiles").select("id,first_name,last_name").order("first_name"),supabase.from("workout_programs").select("id,user_id,status,updated_at"),supabase.from("weekly_reviews").select("*").order("week_start",{ascending:false}),supabase.from("workout_sessions").select("*").order("started_at",{ascending:false}),supabase.from("training_decisions").select("*").order("decision_date",{ascending:false})]);setRows(p.data??[]);setPrograms(pr.data??[]);setReviews(r.data??[]);setSessions(s.data??[]);setDecisions(d.data??[])})()},[]);
  const attention=useMemo(() => {
    const order = { RED: 0, YELLOW: 1, GREEN: 2 } as const;
    return rows.map((client) => {
      const review = reviews.find((item) => item.user_id === client.id);
      const level: keyof typeof order = review?.attention_level === "RED" || review?.attention_level === "YELLOW" || review?.attention_level === "GREEN" ? review.attention_level : classifyAttention({
        pain: review?.pain ?? 0,
        sleepQuality: review?.sleep ?? 5,
        energy: review?.energy ?? 5,
        stress: review?.stress ?? 1,
        completionRate: review?.planned_workouts ? Math.round((review.completed_workouts / review.planned_workouts) * 100) : 100,
        repeatedMisses: Math.max(0, (review?.planned_workouts ?? 0) - (review?.completed_workouts ?? 0)),
      });
      return { id: client.id as string, first_name: client.first_name as string | null, last_name: client.last_name as string | null, level };
    }).sort((a, b) => order[a.level] - order[b.level]);
  }, [rows, reviews]);
  const stats=[{label:"Clients Active",value:rows.length,icon:Dumbbell},{label:"Programs in Draft",value:programs.filter(x=>x.status==="draft").length,icon:FileClock},{label:"Awaiting Approval",value:decisions.filter(x=>x.approval_status==="pending").length,icon:Clock3},{label:"Published",value:programs.filter(x=>x.status==="published").length,icon:CheckCircle2},{label:"RED Clients",value:attention.filter(x=>x.level==="RED").length,icon:ShieldAlert},{label:"YELLOW Clients",value:attention.filter(x=>x.level==="YELLOW").length,icon:AlertTriangle},{label:"Missed Workouts",value:sessions.filter(x=>x.status==="missed").length,icon:Clock3},{label:"Progressions Suggested",value:decisions.filter(x=>x.decision_type==="PROGRESSION_SUGGESTED"&&x.approval_status==="pending").length,icon:ArrowRight},{label:"Reassessments Due",value:decisions.filter(x=>x.decision_type==="REASSESSMENT_DUE"&&x.approval_status==="pending").length,icon:BookOpen}];
  return <AppShell admin><div className="mx-auto max-w-7xl px-5 py-10"><p className="sim-kicker">Money Brain · Training Intelligence</p><div className="mt-4 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-5xl">Decisão antes da prescrição.</h1><p className="mt-3 max-w-2xl text-muted-foreground">Dado → evidência → prioridade → decisão → execução → resposta.</p></div><div className="flex flex-wrap gap-4 text-xs uppercase text-primary"><Link to="/admin/training/photo-protocol">Photo Protocol →</Link><Link to="/admin/training/exercises">Exercise Library →</Link><Link to="/admin/training/knowledge">Knowledge Base →</Link></div></div><section className="mt-10 grid gap-px bg-border sm:grid-cols-3">{stats.map(({label,value,icon:Icon})=><div key={label} className="bg-background p-5"><Icon className="size-4 text-primary"/><p className="mt-5 font-display text-4xl">{value}</p><p className="sim-kicker mt-2">{label}</p></div>)}</section><section className="mt-12"><p className="sim-kicker">Who needs me today?</p><div className="mt-5 divide-y divide-border border-y border-border">{attention.map(client=><Link key={client.id} to="/admin/training/$studentId" params={{studentId:client.id}} className="grid gap-3 py-4 sm:grid-cols-[100px_1fr_auto]"><span className={client.level==="RED"?"text-destructive":client.level==="YELLOW"?"text-primary":"text-muted-foreground"}>{client.level}</span><span>{client.first_name} {client.last_name}</span><ArrowRight className="size-4"/></Link>)}</div></section></div></AppShell>
}