import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brand } from "@/components/sim/Brand";
import { CinematicBackdrop } from "@/components/sim/CinematicBackdrop";

const searchSchema = z.object({ mode: z.enum(["signup"]).optional() });
const authSchema = z.object({ email: z.string().email("Informe um email válido").max(255), password: z.string().min(8, "Use ao menos 8 caracteres").max(72) });

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({ meta: [
    { title: "Acesso privado — Shape Is Money" }, { name: "description", content: "Acesse sua carteira privada de performance executiva." },
    { property: "og:title", content: "Acesso privado — Shape Is Money" }, { property: "og:description", content: "Governe o corpo. Sustente a vida." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const [signup, setSignup] = useState(search.mode === "signup");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const navigate = useNavigate();
  async function submit(event: React.FormEvent) { event.preventDefault(); const parsed = authSchema.safeParse({ email, password }); if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? "Revise os dados."); return; } setBusy(true); setMessage(""); if (signup) { const [firstName, ...rest] = name.trim().split(/\s+/); const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { first_name: firstName ?? "", last_name: rest.join(" ") } } }); setMessage(error?.message ?? (data.session ? "Acesso confirmado." : "Confirme seu email para ativar o acesso.")); if (data.session) await navigate({ to: "/onboarding" }); } else { const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setMessage("Não foi possível entrar. Verifique suas credenciais."); else { const userId=data.user?.id; const { data:profile }=userId?await supabase.from("profiles").select("onboarding_completed_at").eq("id",userId).maybeSingle():{data:null}; await navigate({ to: profile?.onboarding_completed_at?"/dashboard":"/onboarding" }); } } setBusy(false); }
  async function google() { const result=await lovable.auth.signInWithOAuth("google",{redirect_uri:window.location.origin}); if(result.error)setMessage("Não foi possível continuar com Google."); }
  return <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.14fr_.86fr]">
    <section className="relative hidden min-h-screen overflow-hidden border-r border-border lg:flex lg:flex-col lg:justify-between lg:p-12"><CinematicBackdrop/><div className="relative z-10 flex items-start justify-between"><Brand compact/><p className="text-[9px] uppercase tracking-[0.28em] text-foreground/45">Private access / 01</p></div><div className="relative z-10 max-w-2xl"><p className="sim-kicker">Executive performance concierge</p><h1 className="mt-7 text-7xl leading-[.98]">Sustente a vida<br/>que você construiu.</h1><p className="mt-7 max-w-md leading-7 text-foreground/60">Corpo, energia, presença e rotina sob uma única direção.</p></div><p className="relative z-10 text-[9px] uppercase tracking-[0.24em] text-foreground/45">Disciplina · Presença · Reputação · Liberdade</p></section>
    <section className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-10"><div className="sim-grain pointer-events-none absolute inset-0"/><div className="relative w-full max-w-md"><div className="mb-14 flex items-start justify-between lg:hidden"><Brand compact/><Link to="/" aria-label="Voltar"><ArrowLeft className="size-4 text-muted-foreground"/></Link></div><p className="sim-kicker">{signup?"Diagnóstico inicial":"Acesso privado"}</p><h2 className="mt-5 text-5xl leading-none">{signup?"Inicie sua calibração.":"Bem-vindo de volta."}</h2><p className="mt-4 text-sm text-muted-foreground">{signup?"Primeiro, estabeleça seu acesso.":"Sua carteira de performance está pronta."}</p><form onSubmit={submit} className="mt-10 space-y-4">{signup&&<Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nome completo" maxLength={120} required/>}<Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email executivo" maxLength={255} required/><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Senha" minLength={8} maxLength={72} required/><Button variant="gold" className="h-12 w-full" disabled={busy}>{busy?"Processando":signup?"Continuar diagnóstico":"Acessar portfolio"}<ArrowRight/></Button></form>{message&&<p className="mt-4 border-l border-primary pl-3 text-sm text-primary" role="status">{message}</p>}<div className="my-7 flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-muted-foreground"><span className="h-px flex-1 bg-border"/>Acesso seguro<span className="h-px flex-1 bg-border"/></div><Button variant="quiet" className="h-12 w-full" onClick={google}>Continuar com Google</Button><div className="mt-8 flex justify-between text-xs text-muted-foreground"><button className="story-link cursor-pointer" onClick={()=>setSignup(!signup)}>{signup?"Já sou membro":"Iniciar diagnóstico"}</button><Link to="/forgot-password" className="story-link">Recuperar acesso</Link></div></div></section>
  </main>;
}