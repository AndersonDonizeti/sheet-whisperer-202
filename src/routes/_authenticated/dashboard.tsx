import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getLancamentos, getGastosFixos, getEmprestimos, importSeedData, claimLegacyData } from "@/lib/financeiro.functions";
import { brl, MESES } from "@/lib/format";
import { resumoMensal } from "@/lib/resumo";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Início — Meu Controle Financeiro" }] }),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const fetchL = useServerFn(getLancamentos);
  const fetchG = useServerFn(getGastosFixos);
  const fetchE = useServerFn(getEmprestimos);
  const doImport = useServerFn(importSeedData);
  const doClaim = useServerFn(claimLegacyData);
  const lanc = useQuery({ queryKey: ["lancamentos"], queryFn: () => fetchL() });
  const gastos = useQuery({ queryKey: ["gastos"], queryFn: () => fetchG() });
  const emp = useQuery({ queryKey: ["emprestimos"], queryFn: () => fetchE() });
  const importar = useMutation({
    mutationFn: () => doImport(),
    onSuccess: () => qc.invalidateQueries(),
  });
  const claim = useMutation({
    mutationFn: () => doClaim(),
    onSuccess: (res) => {
      if (res.claimed) qc.invalidateQueries();
    },
  });
  const vazio = !lanc.isLoading && !lanc.error && (lanc.data ?? []).length === 0;
  const [claimFeito, setClaimFeito] = useState(false);
  useEffect(() => {
    if (vazio && !claimFeito) {
      setClaimFeito(true);
      claim.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vazio, claimFeito]);

  const anos = useMemo(() => {
    const s = new Set((lanc.data ?? []).map((l) => l.data.slice(0, 4)));
    s.add(String(new Date().getFullYear()));
    return [...s].sort().reverse();
  }, [lanc.data]);
  const [ano, setAno] = useState(String(new Date().getFullYear()));

  const meses = useMemo(
    () => resumoMensal(lanc.data ?? [], gastos.data ?? [], ano),
    [lanc.data, gastos.data, ano],
  );

  if (lanc.isLoading) {
    return <AppShell title="Início"><p className="text-muted-foreground">Carregando...</p></AppShell>;
  }

  if (vazio) {
    return (
      <AppShell title="Início">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">Bem-vindo!</h2>
          {claim.isPending ? (
            <p className="mt-2 text-sm text-muted-foreground">Verificando seus dados...</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Importe o histórico da sua planilha (594 lançamentos, gastos fixos e empréstimos) com um clique.
              </p>
              <button
                onClick={() => importar.mutate()}
                disabled={importar.isPending}
                className="mt-5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {importar.isPending ? "Importando..." : "Importar dados da planilha"}
              </button>
              {importar.error && <p className="mt-3 text-sm text-expense">{importar.error.message}</p>}
            </>
          )}
        </div>
      </AppShell>
    );
  }

  const tot = meses.reduce(
    (a, m) => ({ uber: a.uber + m.uber, n99: a.n99 + m.n99, receita: a.receita + m.receita, despesa: a.despesa + m.despesa, fixos: a.fixos + m.fixos }),
    { uber: 0, n99: 0, receita: 0, despesa: 0, fixos: 0 },
  );
  const lucro = tot.receita - tot.despesa;
  const mesesAtivos = meses.filter((m) => m.receita > 0).length || 1;
  const dividaTotal = (emp.data?.emprestimos ?? []).reduce((s, e) => s + Number(e.saldo_devedor), 0);
  const maxBar = Math.max(...meses.map((m) => Math.max(m.receita, m.despesa)), 1);

  return (
    <AppShell title="Início">
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {anos.map((a) => (
          <button
            key={a}
            onClick={() => setAno(a)}
            className={`rounded-full px-4 py-1.5 text-sm ${a === ano ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Lucro em {ano} (corridas − despesas do carro)</p>
        <p className={`mt-1 text-3xl font-bold ${lucro >= 0 ? "text-income" : "text-expense"}`}>{brl(lucro)}</p>
        <p className="mt-1 text-sm text-muted-foreground">Média mensal: {brl(lucro / mesesAtivos)}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label="Receita total" value={brl(tot.receita)} tone="income" />
        <Stat label="Despesas do carro" value={brl(tot.despesa)} tone="expense" />
        <Stat label="Uber" value={brl(tot.uber)} />
        <Stat label="99" value={brl(tot.n99)} />
        <Stat label="Gastos fixos pagos" value={brl(tot.fixos)} tone="expense" />
        <Stat label="Dívidas em aberto" value={brl(dividaTotal)} tone="expense" />
      </div>

      <h2 className="mb-3 mt-6 font-semibold">Mês a mês</h2>
      <div className="flex flex-col gap-2">
        {meses.filter((m) => m.receita > 0 || m.despesa > 0 || m.fixos > 0).map((m) => (
          <div key={m.mes} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{MESES[m.mes]}</span>
              <span className={m.receita - m.despesa >= 0 ? "text-income font-semibold" : "text-expense font-semibold"}>
                {brl(m.receita - m.despesa)}
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <div className="h-2 rounded-full bg-income" style={{ width: `${(m.receita / maxBar) * 100}%` }} />
              <div className="h-2 rounded-full bg-expense" style={{ width: `${(m.despesa / maxBar) * 100}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Receita {brl(m.receita)}</span>
              <span>Despesa {brl(m.despesa)}</span>
            </div>
            {m.fixos > 0 && <p className="mt-1 text-xs text-muted-foreground">Gastos fixos: {brl(m.fixos)}</p>}
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "income" | "expense" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-semibold ${tone === "income" ? "text-income" : tone === "expense" ? "text-expense" : ""}`}>{value}</p>
    </div>
  );
}
