import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, TrendingUp, HandCoins, ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meu Controle Financeiro — Corridas, gastos e empréstimos" },
      {
        name: "description",
        content:
          "Controle suas receitas de corridas Uber e 99, gastos fixos e empréstimos em um só lugar.",
      },
      { property: "og:title", content: "Meu Controle Financeiro" },
      {
        property: "og:description",
        content:
          "Controle suas receitas de corridas Uber e 99, gastos fixos e empréstimos em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <Wallet className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="max-w-md text-3xl font-bold leading-tight">
        Meu Controle Financeiro
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Acompanhe suas corridas na Uber e 99, controle gastos fixos e quite seus
        empréstimos — tudo em um só lugar, direto do celular.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <ArrowLeftRight className="h-6 w-6 text-primary" />
          Lançamentos
        </div>
        <div className="flex flex-col items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Resumos
        </div>
        <div className="flex flex-col items-center gap-2">
          <HandCoins className="h-6 w-6 text-primary" />
          Empréstimos
        </div>
      </div>
      <Link
        to="/auth"
        className="mt-10 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:opacity-90"
      >
        Entrar no app
      </Link>
    </div>
  );
}
