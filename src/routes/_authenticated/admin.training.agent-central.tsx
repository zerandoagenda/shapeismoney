import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BrainCircuit, FileText, FileUp, Plus, Search } from "lucide-react";
import { requireStaff } from "@/lib/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/sim/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const creationOptions=[
  {Icon:BrainCircuit,title:"Agente de IA",body:"Dados, evidências e regras SIM.",mode:"ai"},
  {Icon:FileUp,title:"PDF",body:"Extração e mapeamento humano.",mode:"pdf"},
  {Icon:FileText,title:"Texto",body:"Prescrição colada e estruturada.",mode:"text"},
  {Icon:Plus,title:"Manual",body:"Editor completo do programa.",mode:"manual"},
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
  const open=(mode?:string)=>{if(!selected)return;if(mode==="manual"){void navigate({to:"/admin/students/$studentId",params:{studentId:selected},hash:"training"});return}if(mode){void navigate({to:"/admin/training/$studentId",params:{studentId:selected},hash:`mode-${mode}`});return}void navigate({to:"/admin/training/$studentId",params:{studentId:selected}})};
  return <AppShell admin><div className="mx-auto min-w-0 max-w-6xl px-4 py-7 sm:px-5 sm:py-10"><p className="sim-kicker">Admin · Training Intelligence</p><h1 className="mt-3 text-3xl leading-tight sm:mt-4 sm:text-5xl">Central do Agente de Treino</h1><p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">Escolha o aluno. A decisão vem antes da prescrição e todo treino permanece em revisão humana até a publicação.</p><section className="mt-8 border-y border-border py-6 sm:mt-10 sm:py-8"><p className="sim-kicker">01 · Selecionar aluno</p><div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"><div className="relative min-w-0"><Search className="absolute left-3 top-4 size-4 text-muted-foreground"/><Input className="w-full pl-10" placeholder="Buscar por nome" value={query} onChange={event=>setQuery(event.target.value)}/></div><select aria-label="Selecionar aluno" className="h-12 min-w-0 w-full border border-input bg-background px-3 text-sm" value={selected} onChange={event=>setSelected(event.target.value)}><option value="">Selecione um aluno</option>{filtered.map(student=><option key={student.id} value={student.id}>{student.first_name} {student.last_name} · {student.plan.toUpperCase()}</option>)}</select><Button variant="gold" className="w-full lg:w-auto" disabled={!selected} onClick={()=>open()}>Abrir central</Button></div></section><section className="mt-8 sm:mt-10"><p className="sim-kicker">02 · Escolher origem</p><div className="mt-5 grid gap-px bg-border min-[480px]:grid-cols-2 xl:grid-cols-4">{creationOptions.map(({Icon,title,body,mode})=><button key={title} className="min-w-0 bg-background p-5 text-left disabled:opacity-50 sm:p-6" disabled={!selected} onClick={()=>open(mode)}><Icon className="size-5 text-primary"/><h2 className="mt-5 break-words text-2xl sm:mt-7">{title}</h2><p className="mt-3 break-words text-sm text-muted-foreground">{body}</p></button>)}</div></section><section className="mt-10 grid gap-px bg-border sm:mt-12 md:grid-cols-3">{[["Draft only","A IA nunca publica automaticamente."],["Biblioteca oficial","Nenhuma equivalência é criada em silêncio."],["Auditoria","Origem, edição, aprovação e decisão são registradas."]].map(([title,body])=><div key={title} className="min-w-0 bg-background p-5"><p className="sim-kicker break-words">{title}</p><p className="mt-3 break-words text-sm text-muted-foreground">{body}</p></div>)}</section></div></AppShell>;
}