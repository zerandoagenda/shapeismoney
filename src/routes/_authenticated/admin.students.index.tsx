import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { requireStaff } from "@/lib/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/sim/AppShell";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/students/")({ beforeLoad: requireStaff, head: () => ({ meta: [{ title: "Alunos — Administração SIM" }, { name: "description", content: "Acompanhe alunos, planos e protocolos." }, { property: "og:title", content: "Alunos — Administração SIM" }, { property: "og:description", content: "Carteira de alunos do Shape Is Money." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Page });
type Student = { id: string; first_name: string; last_name: string; plan: string; country: string | null; score: number | null; protocol: string | null };

function Page() {
  const [students, setStudents] = useState<Student[]>([]); const [query, setQuery] = useState("");
  useEffect(() => { void (async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id,role");
    const staffRoles = new Set(["coach","nutritionist","support","manager","admin","admin_master"]);
    const staffIds = new Set((roles ?? []).filter((row)=>staffRoles.has(row.role)).map((row)=>row.user_id));
    const ids = (roles ?? []).filter((row)=>row.role==="student"&&!staffIds.has(row.user_id)).map((row)=>row.user_id); if (!ids.length) { setStudents([]); return; }
    const [profiles, scores, protocols] = await Promise.all([
      supabase.from("profiles").select("id,first_name,last_name,plan,country").in("id", ids).order("created_at", { ascending: false }),
      supabase.from("sim_scores").select("user_id,total,created_at").in("user_id", ids).order("created_at", { ascending: false }),
      supabase.from("protocols").select("user_id,status,created_at").in("user_id", ids).order("created_at", { ascending: false }),
    ]);
    setStudents((profiles.data ?? []).map((profile) => ({ ...profile, score: scores.data?.find((score) => score.user_id === profile.id)?.total ?? null, protocol: protocols.data?.find((protocol) => protocol.user_id === profile.id)?.status ?? null })));
  })(); }, []);
  const filtered = useMemo(() => students.filter((student) => `${student.first_name} ${student.last_name}`.toLowerCase().includes(query.toLowerCase())), [students, query]);
  return <AppShell admin><div className="mx-auto max-w-7xl px-5 py-10"><p className="sim-kicker">Carteira de alunos</p><h1 className="mt-4 text-5xl">Alunos</h1><div className="relative mt-8 max-w-md"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-10" placeholder="Buscar aluno" value={query} onChange={(event)=>setQuery(event.target.value)}/></div><div className="sim-panel mt-6 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-border text-[10px] uppercase tracking-[0.16em] text-muted-foreground"><tr>{["Aluno","Plano","País","SIM Score","Protocolo"].map((heading)=><th className="px-5 py-4 font-medium" key={heading}>{heading}</th>)}</tr></thead><tbody>{filtered.length ? filtered.map((student)=><tr key={student.id} className="border-b border-border/60"><td className="px-5 py-5"><Link to="/admin/students/$studentId" params={{studentId:student.id}} className="story-link">{student.first_name} {student.last_name}</Link></td><td className="px-5 py-5 uppercase text-primary">{student.plan}</td><td className="px-5 py-5">{student.country??"—"}</td><td className="px-5 py-5">{student.score??"—"}</td><td className="px-5 py-5 text-muted-foreground">{student.protocol?.replaceAll("_"," ")??"Sem protocolo"}</td></tr>) : <tr><td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">Os novos alunos aparecerão aqui após o cadastro.</td></tr>}</tbody></table></div></div></AppShell>;
}