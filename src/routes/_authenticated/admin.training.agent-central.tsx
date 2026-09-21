import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BrainCircuit, FileText, FileUp, Plus, Search } from "lucide-react";
import { requireStaff } from "@/lib/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/sim/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const creationOptions=[
  {Icon:BrainCircuit,title:"Agente de IA",body:"Dados, evidências e regras SIM."},
  {Icon:FileUp,title:"PDF",body:"Extração e mapeamento humano."},
  {Icon:FileText,title:"Texto",body:"Prescrição colada e estruturada."},
  {Icon:Plus,title:"Manual",body:"Editor completo do programa."},
];

export const Route=createFileRoute("/_authenticated/admin/training/agent-central")({
  beforeLoad:requireStaff,
  head:()=>({meta:[{title:"Central do Agente de Treino — SIM"},{name:"description",content:"Seleção do aluno e criação de treino por IA, PDF, texto ou montagem manual."},{property:"og:title",content:"Central do Agente de Treino — SIM"},{property:"og:description",content:"Decisão, prescrição e revisão humana em um único fluxo."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),
  component:Page,
});

function Page(){
  const navigate=useNavigate();
  const[students,setStudents]=useState<Array<{id:string;first_name:string|null;last_name:string|null;plan:string}>>([]);
  const[query,setQuery]=useState("");
  const[selected,setSelected]=useState("");
  useEffect(()=>{void(async()=>{const[{data:profiles},{data:roles}]=await Promise.all([supabase.from("profiles").select("id,first_name,last_name,plan").order("first_name"),supabase.from("user_roles").select("user_id,role")]);const staff=new Set((roles??[]).filter(row=>["coach","nutritionist","support","manager","admin","admin_master","content","analyst","relationship","nutrition","specialist"].includes(row.role)).map(row=>row.user_id));setStudents((profiles??[]).filter(profile=>!staff.has(profile.id)))})()},[]);
  const filtered=useMemo(()=>students.filter(student=>`${student.first_name??""} ${student.last_name??""}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))),[students,query]);
  const open=()=>{if(selected)void navigate({to:"/admin/training/$studentId",params:{studentId:selected}})};
  return <AppShell admin><div className="mx-auto max-w-6xl px-5 py-10"><p className="sim-kicker">Admin · Training Intelligence</p><h1 className="mt-4 text-5xl">Central do Agente de Treino</h1><p className="mt-4 max-w-2xl text-muted-foreground">Escolha o aluno. A decisão vem antes da prescrição e todo treino permanece em revisão humana até a publicação.</p><section className="mt-10 border-y border-border py-8"><p className="sim-kicker">01 · Selecionar aluno</p><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><div className="relative"><Search className="absolute left-3 top-4 size-4 text-muted-foreground"/><Input className="pl-10" placeholder="Buscar por nome" value={query} onChange={event=>setQuery(event.target.value)}/></div><select aria-label="Selecionar aluno" className="h-12 border border-input bg-background px-3 text-sm" value={selected} onChange={event=>setSelected(event.target.value)}><option value="">Selecione um aluno</option>{filtered.map(student=><option key={student.id} value={student.id}>{student.first_name} {student.last_name} · {student.plan.toUpperCase()}</option>)}</select><Button variant="gold" disabled={!selected} onClick={open}>Abrir central</Button></div></section><section className="mt-10"><p className="sim-kicker">02 · Escolher origem</p><div className="mt-5 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">{creationOptions.map(({Icon,title,body})=><button key={String(title)} className="bg-background p-6 text-left disabled:opacity-50" disabled={!selected} onClick={open}><Icon className="size-5 text-primary"/><h2 className="mt-7 text-2xl">{title}</h2><p className="mt-3 text-sm text-muted-foreground">{body}</p></button>)}</div></section><section className="mt-12 grid gap-px bg-border sm:grid-cols-3">{[["Draft only","A IA nunca publica automaticamente."],["Biblioteca oficial","Nenhuma equivalência é criada em silêncio."],["Auditoria","Origem, edição, aprovação e decisão são registradas."]].map(([title,body])=><div key={title} className="bg-background p-5"><p className="sim-kicker">{title}</p><p className="mt-3 text-sm text-muted-foreground">{body}</p></div>)}</section></div></AppShell>;
}