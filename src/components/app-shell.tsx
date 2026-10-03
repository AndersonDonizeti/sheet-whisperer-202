import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, ArrowLeftRight, Home, HandCoins, LogOut, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

const tabs = [
  { to: "/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/lancamentos", label: "Lançamentos", icon: ArrowLeftRight },
  { to: "/gastos-fixos", label: "Gastos Fixos", icon: Home },
  { to: "/emprestimos", label: "Empréstimos", icon: HandCoins },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold">{title}</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card">
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
