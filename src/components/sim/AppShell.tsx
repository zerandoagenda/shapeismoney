import { Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, CheckSquare, Dumbbell, Home, LogOut, Shield, UserRound, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";

const nav = [
  ["/dashboard", "Home", Home], ["/training", "Treino", Dumbbell], ["/check-ins", "Check-in", CheckSquare],
  ["/nutrition", "Nutrição", Utensils], ["/profile", "Perfil", UserRound],
] as const;

export function AppShell({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const navigate = useNavigate();
  async function signOut() { await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card px-6 py-8 lg:block">
        <Brand />
        <p className="sim-kicker mt-14">{admin ? "Administração" : "Governo do corpo"}</p>
        <nav className="mt-6 space-y-1">
          {(admin ? [["/admin", "Visão geral", BarChart3], ["/admin/students", "Alunos", UserRound]] as const : nav).map(([to,label,Icon]) => (
            <Link key={to} to={to} className="flex items-center gap-3 border-l border-transparent px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground" activeProps={{ className: "border-primary text-foreground bg-muted" }}><Icon className="size-4" />{label}</Link>
          ))}
        </nav>
        {!admin && <Link to="/admin" className="mt-10 flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground"><Shield className="size-4"/>Admin</Link>}
        <Button variant="ghost" className="absolute bottom-7 left-6 justify-start text-muted-foreground" onClick={signOut}><LogOut/>Sair</Button>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur lg:hidden"><Brand compact/><span className="sim-kicker">SIM OS</span></header>
      <main className="pb-24 lg:ml-64 lg:pb-0">{children}</main>
      {!admin && <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card px-1 lg:hidden">{nav.map(([to,label,Icon])=><Link key={to} to={to} className="flex h-16 flex-col items-center justify-center gap-1 text-[9px] uppercase text-muted-foreground" activeProps={{className:"text-primary"}}><Icon className="size-4"/>{label}</Link>)}</nav>}
    </div>
  );
}