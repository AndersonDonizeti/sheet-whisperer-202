import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getLancamentos, addLancamento, deleteLancamento } from "@/lib/financeiro.functions";
import { brl, formatData, mesAno } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/lancamentos")({
  head: () => ({ meta: [{ title: "Lançamentos — Meu Controle Financeiro" }] }),
  component: Lancamentos,
});

const hoje = () => new Date().toISOString().slice(0, 10);
const inputCls = "rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary w-full";

function Lancamentos() {
  const qc = useQueryClient();
  const fetchL = useServerFn(getLancamentos);
  const add = useServerFn(addLancamento);
  const del = useServerFn(deleteLancamento);
  const { data = [], isLoading } = useQuery({ queryKey: ["lancamentos"], queryFn: () => fetchL() });

  const [tipo, setTipo] = useState<"Receita" | "Despesa">("Receita");
  const [plataforma, setPlataforma] = useState("Uber");
  const [categoria, setCategoria] = useState("Combustível");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataL, setDataL] = useState(hoje());
  const [combustivel, setCombustivel] = useState("Etanol");
  const [litros, setLitros] = useState("");
  const [odometro, setOdometro] = useState("");

  const isCombustivel = tipo === "Despesa" && categoria === "Combustível";

  const addM = useMutation({
    mutationFn: () =>
      add({
        data: {
          data: dataL,
          tipo,
          categoria: tipo === "Receita" ? "Corrida" : categoria,
          descricao: tipo === "Receita" ? plataforma : descricao || (isCombustivel ? combustivel : categoria),
          valor: Number(valor.replace(",", ".")),
          plataforma: tipo === "Receita" ? plataforma : "",
          obs: "",
          combustivel: isCombustivel ? combustivel : null,
          litros: isCombustivel && litros ? Number(litros.replace(",", ".")) : null,
          odometro: isCombustivel && odometro ? Number(odometro.replace(",", ".")) : null,
        },
      }),
    onSuccess: () => { setValor(""); setDescricao(""); setLitros(""); setOdometro(""); qc.invalidateQueries({ queryKey: ["lancamentos"] }); },
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lancamentos"] }),
  });

  const mesesDisp = useMemo(() => [...new Set(data.map((l) => mesAno(l.data)))], [data]);
  const [filtro, setFiltro] = useState<string>("");
  const mesFiltro = filtro || mesesDisp[0] || "";
  const lista = data.filter((l) => mesAno(l.data) === mesFiltro);
  const rec = lista.filter((l) => l.tipo === "Receita").reduce((s, l) => s + Number(l.valor), 0);
  const desp = lista.filter((l) => l.tipo === "Despesa").reduce((s, l) => s + Number(l.valor), 0);

  // Consumo do carro: km rodados entre abastecimentos ÷ litros do período
  const consumo = useMemo(() => {
    const abs = data
      .filter((l) => l.categoria === "Combustível" && l.litros != null && l.odometro != null)
      .sort((a, b) => a.data.localeCompare(b.data));
    if (abs.length < 2) return null;
    const odos = abs.map((l) => Number(l.odometro));
    const kmRodados = Math.max(...odos) - Math.min(...odos);
    const litrosTotal = abs.reduce((s, l) => s + Number(l.litros), 0);
    if (kmRodados <= 0 || litrosTotal <= 0) return null;
    return { kml: kmRodados / litrosTotal, kmRodados, litrosTotal };
  }, [data]);

  return (
    <AppShell title="Lançamentos">
      <form
        onSubmit={(e) => { e.preventDefault(); if (Number(valor.replace(",", ".")) > 0) addM.mutate(); }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <div className="mb-3 grid grid-cols-2 gap-2">
          {(["Receita", "Despesa"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTipo(t)}
              className={`rounded-lg py-2 text-sm font-medium ${tipo === t ? (t === "Receita" ? "bg-income text-primary-foreground" : "bg-expense text-destructive-foreground") : "bg-secondary text-secondary-foreground"}`}
            >
              {t === "Receita" ? "+ Corrida" : "− Despesa"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tipo === "Receita" ? (
            <select value={plataforma} onChange={(e) => setPlataforma(e.target.value)} className={inputCls}>
              <option>Uber</option><option>99</option><option>Outros</option>
            </select>
          ) : (
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
              <option>Combustível</option><option>Manutenção</option><option>Alimentação</option><option>Lavagem</option><option>Outros</option>
            </select>
          )}
          <input type="date" value={dataL} onChange={(e) => setDataL(e.target.value)} className={inputCls} />
          {tipo === "Despesa" && (
            <input placeholder="Descrição (ex: Etanol)" value={descricao} onChange={(e) => setDescricao(e.target.value)} className={`${inputCls} col-span-2`} />
          )}
          <input inputMode="decimal" placeholder="Valor R$" value={valor} onChange={(e) => setValor(e.target.value)} className={`${inputCls} col-span-2 text-lg`} required />
        </div>
        <button type="submit" disabled={addM.isPending} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {addM.isPending ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      <div className="mb-3 mt-6 flex items-center justify-between gap-2">
        <select value={mesFiltro} onChange={(e) => setFiltro(e.target.value)} className="rounded-lg border border-input bg-card px-3 py-2 text-sm">
          {mesesDisp.map((m) => <option key={m}>{m}</option>)}
        </select>
        <div className="text-right text-xs">
          <p className="text-income">+{brl(rec)}</p>
          <p className="text-expense">−{brl(desp)}</p>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Carregando...</p>}
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {lista.map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{l.descricao || l.categoria}</p>
              <p className="text-xs text-muted-foreground">{formatData(l.data)} · {l.categoria}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${l.tipo === "Receita" ? "text-income" : "text-expense"}`}>
                {l.tipo === "Receita" ? "+" : "−"}{brl(Number(l.valor))}
              </span>
              <button onClick={() => confirm("Excluir este lançamento?") && delM.mutate(l.id)} aria-label="Excluir" className="text-muted-foreground hover:text-expense">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && lista.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhum lançamento.</p>}
      </div>
    </AppShell>
  );
}
