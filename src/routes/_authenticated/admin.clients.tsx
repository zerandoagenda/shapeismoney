import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BrainCircuit, HeartHandshake, Search, UsersRound } from "lucide-react";
import { AppShell } from "@/components/sim/AppShell";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/admin-guard";

export const Route=createFileRoute("/_authenticated/admin/clients")({beforeLoad:requireStaff,head:()=>({meta:[{title:"Clientes — SIM Command Center"},{name:"description",content:"Carteira e operação individual dos clientes."},{property:"og:title",content:"Clientes — SIM Command Center"},{property:"og:description",content:"Carteira, relacionamento e decisões por cliente."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:Page});

const areas=[
  {title:"Carteira de clientes",detail:"Busca, saúde, plano, adesão e acesso ao Client 360.",to:"/admin/students" as const,icon:UsersRound},
  {title:"Relationship OS",detail:"Atenção, First Win, compromissos e relacionamento.",to:"/admin/relationship" as const,icon:HeartHandshake},
  {title:"Agente de treino",detail:"Selecione um cliente e crie por IA, PDF, texto ou manual.",to:"/admin/training/agent-central" as const,icon:BrainCircuit},
];
function Page(){return <AppShell admin><div className="mx-auto max-w-6xl px-5 py-10"><p className="sim-kicker">Operação da carteira</p><h1 className="mt-4 text-5xl">Clientes</h1><p className="mt-4 max-w-2xl text-muted-foreground">Encontre o cliente e tome a decisão no contexto completo.</p><div className="mt-10 divide-y divide-border border-y border-border">{areas.map(({title,detail,to,icon:Icon})=><Link key={to} to={to} className="grid gap-4 py-7 sm:grid-cols-[48px_1fr_auto] sm:items-center"><Icon className="size-5 text-primary"/><span><span className="block text-2xl">{title}</span><span className="mt-2 block text-sm text-muted-foreground">{detail}</span></span><ArrowRight className="size-4 text-primary"/></Link>)}</div><Button asChild variant="quiet" className="mt-8"><Link to="/admin/students"><Search/>Buscar cliente</Link></Button></div></AppShell>}