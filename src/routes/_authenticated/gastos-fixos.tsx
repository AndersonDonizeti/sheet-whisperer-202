import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getGastosFixos, addGastoFixo, deleteGastoFixo } from "@/lib/financeiro.functions";
import { brl, formatData, mesAno } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/gastos-fixos")({
  head: () => ({ meta: [{ title: "Gastos Fixos — Meu Controle Financeiro" }] }),
  component: GastosFixos,
});

const CONTAS = ["Internet", "Luz", "Condomínio", "C. Santander", "Parc. Carro", "C. Inter", "Plano de Saúde", "Mei", "Gás", "IPVA", "C. Gaby", "Ap", "Outros Gastos"];
const inputCls = "rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary w-full";

function GastosFixos() {
  const qc = useQueryClient();
  const fetchG = useServerFn(getGastosFixos);
  const add = useServerFn(addGastoFixo);
  const del = useServerFn(deleteGastoFixo);
  const { data = [] } = useQuery({ queryKey: ["gastos"], queryFn: () => fetchG() });

  const [categoria, setCategoria] = useState(CONTAS[0]);
  const [valor, setValor] = useState("");
  const [dataG, setDataG] = useState(new Date().toISOString().slice(0, 10));

  const addM = useMutation({
    mutationFn: () => add({ data: { data: dataG, categoria, valor: Number(valor.replace(",", ".")) } }),
    onSuccess: () => { setValor(""); qc.invalidateQueries({ queryKey: ["gastos"] }); },
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gastos"] }),
  });

  const mesAtual = mesAno(new Date().toISOString());
  const mesesDisp = useMemo(() => [...new Set([mesAtual, ...data.map((g) => mesAno(g.data))])], [data, mesAtual]);
  const [filtro, setFiltro] = useState(mesAtual);
  const doMes = data.filter((g) => mesAno(g.data) === filtro);
  const pagas = new Set(doMes.map((g) => g.categoria.toLowerCase()));
  const total = doMes.reduce((s, g) => s + Number(g.valor), 0);

  return (
    <AppShell title="Gastos Fixos">
      <div className="mb-3 flex items-center justify-between">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded-lg border border-input bg-card px-3 py-2 text-sm">
          {mesesDisp.map((m) => <option key={m}>{m}</option>)}
        </select>
        <p className="text-sm">Total pago: <span className="font-semibold text-expense">{brl(total)}</span></p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {CONTAS.map((c) => {
          const paga = pagas.has(c.toLowerCase());
          return (
            <span key={c} className={`rounded-full px-3 py-1 text-xs ${paga ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
              {paga ? "✓ " : ""}{c}
            </span>
          );
        })}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (Number(valor.replace(",", ".")) > 0) addM.mutate(); }} className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 text-sm font-medium">Registrar conta paga</p>
        <div className="grid grid-cols-2 gap-2">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
            {CONTAS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="date" value={dataG} onChange={(e) => setDataG(e.target.value)} className={inputCls} />
          <input inputMode="decimal" placeholder="Valor R$" value={valor} onChange={(e) => setValor(e.target.value)} className={`${inputCls} col-span-2`} required />
        </div>
        <button type="submit" disabled={addM.isPending} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {addM.isPending ? "Salvando..." : "Registrar pagamento"}
        </button>
      </form>

      <div className="mt-4 flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {doMes.map((g) => (
          <div key={g.id} className="flex items-center justify-between px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">{g.categoria}</p>
              <p className="text-xs text-muted-foreground">{formatData(g.data)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{brl(Number(g.valor))}</span>
              <button onClick={() => confirm("Excluir?") && delM.mutate(g.id)} aria-label="Excluir" className="text-muted-foreground hover:text-expense">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {doMes.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhuma conta paga neste mês.</p>}
      </div>
    </AppShell>
  );
}
