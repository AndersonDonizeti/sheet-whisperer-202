import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Trash2, Plus, Settings2, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  getGastosFixos,
  addGastoFixo,
  deleteGastoFixo,
  getCategoriasGastos,
  addCategoriaGasto,
  deleteCategoriaGasto,
} from "@/lib/financeiro.functions";
import { brl, formatData, mesAno } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/gastos-fixos")({
  head: () => ({ meta: [{ title: "Gastos Fixos — Meu Controle Financeiro" }] }),
  component: GastosFixos,
});

const inputCls = "rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary w-full";

function GastosFixos() {
  const qc = useQueryClient();
  const fetchG = useServerFn(getGastosFixos);
  const add = useServerFn(addGastoFixo);
  const del = useServerFn(deleteGastoFixo);
  const fetchCat = useServerFn(getCategoriasGastos);
  const addCat = useServerFn(addCategoriaGasto);
  const delCat = useServerFn(deleteCategoriaGasto);

  const { data = [] } = useQuery({ queryKey: ["gastos"], queryFn: () => fetchG() });
  const { data: categorias = [] } = useQuery({ queryKey: ["categorias-gastos"], queryFn: () => fetchCat() });

  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [dataG, setDataG] = useState(new Date().toISOString().slice(0, 10));
  const [gerenciar, setGerenciar] = useState(false);
  const [novaCat, setNovaCat] = useState("");

  const catSel = categoria || categorias[0]?.nome || "";

  const addM = useMutation({
    mutationFn: () => add({ data: { data: dataG, categoria: catSel, valor: Number(valor.replace(",", ".")) } }),
    onSuccess: () => { setValor(""); qc.invalidateQueries({ queryKey: ["gastos"] }); },
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gastos"] }),
  });
  const addCatM = useMutation({
    mutationFn: (nome: string) => addCat({ data: { nome } }),
    onSuccess: () => { setNovaCat(""); qc.invalidateQueries({ queryKey: ["categorias-gastos"] }); },
  });
  const delCatM = useMutation({
    mutationFn: (id: string) => delCat({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias-gastos"] }),
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

      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Contas do mês</p>
        <button
          onClick={() => setGerenciar((v) => !v)}
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground"
        >
          {gerenciar ? <X className="h-3.5 w-3.5" /> : <Settings2 className="h-3.5 w-3.5" />}
          {gerenciar ? "Fechar" : "Gerenciar contas"}
        </button>
      </div>

      {gerenciar && (
        <div className="mb-3 rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-medium">Adicionar nova conta</p>
          <form
            onSubmit={(e) => { e.preventDefault(); const n = novaCat.trim(); if (n) addCatM.mutate(n); }}
            className="flex gap-2"
          >
            <input
              placeholder="Ex: Aluguel, Netflix..."
              value={novaCat}
              onChange={(e) => setNovaCat(e.target.value)}
              className={inputCls}
            />
            <button
              type="submit"
              disabled={addCatM.isPending || !novaCat.trim()}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </form>
          <p className="mb-2 mt-4 text-sm font-medium">Contas cadastradas</p>
          <div className="flex flex-col divide-y divide-border">
            {categorias.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2">
                <span className="text-sm">{c.nome}</span>
                <button
                  onClick={() => confirm(`Remover a conta "${c.nome}" da lista? Os pagamentos já registrados não são apagados.`) && delCatM.mutate(c.id)}
                  aria-label={`Remover ${c.nome}`}
                  className="text-muted-foreground hover:text-expense"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {categorias.length === 0 && <p className="py-2 text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>}
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {categorias.map((c) => {
          const paga = pagas.has(c.nome.toLowerCase());
          return (
            <span key={c.id} className={`rounded-full px-3 py-1 text-xs ${paga ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
              {paga ? "✓ " : ""}{c.nome}
            </span>
          );
        })}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (catSel && Number(valor.replace(",", ".")) > 0) addM.mutate(); }} className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 text-sm font-medium">Registrar conta paga</p>
        <div className="grid grid-cols-2 gap-2">
          <select value={catSel} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
            {categorias.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
          </select>
          <input type="date" value={dataG} onChange={(e) => setDataG(e.target.value)} className={inputCls} />
          <input inputMode="decimal" placeholder="Valor R$" value={valor} onChange={(e) => setValor(e.target.value)} className={`${inputCls} col-span-2`} required />
        </div>
        <button type="submit" disabled={addM.isPending || categorias.length === 0} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
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
