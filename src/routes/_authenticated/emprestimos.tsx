import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getEmprestimos, addEmprestimo, addPagamento } from "@/lib/financeiro.functions";
import { brl, formatData } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/emprestimos")({
  head: () => ({ meta: [{ title: "Empréstimos — Meu Controle Financeiro" }] }),
  component: Emprestimos,
});

const inputCls = "rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary w-full";

function Emprestimos() {
  const qc = useQueryClient();
  const fetchE = useServerFn(getEmprestimos);
  const addE = useServerFn(addEmprestimo);
  const addP = useServerFn(addPagamento);
  const { data } = useQuery({ queryKey: ["emprestimos"], queryFn: () => fetchE() });
  const emprestimos = data?.emprestimos ?? [];
  const pagamentos = data?.pagamentos ?? [];

  const [novo, setNovo] = useState(false);
  const [desc, setDesc] = useState("");
  const [credor, setCredor] = useState("");
  const [valorOrig, setValorOrig] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const [valorPag, setValorPag] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["emprestimos"] });
  const novoM = useMutation({
    mutationFn: () => addE({ data: { descricao: desc, credor, valor_original: Number(valorOrig.replace(",", ".")) } }),
    onSuccess: () => { setNovo(false); setDesc(""); setCredor(""); setValorOrig(""); invalidate(); },
  });
  const pagM = useMutation({
    mutationFn: (id: string) => addP({ data: { emprestimo_id: id, data: new Date().toISOString().slice(0, 10), valor: Number(valorPag.replace(",", ".")), obs: "" } }),
    onSuccess: () => { setValorPag(""); invalidate(); },
  });

  const totalDevido = emprestimos.reduce((s, e) => s + Number(e.saldo_devedor), 0);
  const totalPago = emprestimos.reduce((s, e) => s + Number(e.total_pago), 0);
  const ordenados = [...emprestimos].sort((a, b) => Number(b.saldo_devedor) - Number(a.saldo_devedor));

  return (
    <AppShell title="Empréstimos">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Ainda devo</p>
          <p className="font-bold text-expense">{brl(totalDevido)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Já paguei</p>
          <p className="font-bold text-income">{brl(totalPago)}</p>
        </div>
      </div>

      <button onClick={() => setNovo(!novo)} className="mt-4 w-full rounded-lg border border-dashed border-border py-2.5 text-sm text-primary">
        {novo ? "Cancelar" : "+ Novo empréstimo"}
      </button>
      {novo && (
        <form onSubmit={(e) => { e.preventDefault(); novoM.mutate(); }} className="mt-2 flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
          <input required placeholder="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)} className={inputCls} />
          <input required placeholder="Credor" value={credor} onChange={(e) => setCredor(e.target.value)} className={inputCls} />
          <input required inputMode="decimal" placeholder="Valor R$" value={valorOrig} onChange={(e) => setValorOrig(e.target.value)} className={inputCls} />
          <button className="rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground">Salvar</button>
        </form>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {ordenados.map((e) => {
          const orig = Number(e.valor_original);
          const pct = orig > 0 ? Math.min(100, (Number(e.total_pago) / orig) * 100) : 0;
          const quitado = Number(e.saldo_devedor) <= 0;
          const pags = pagamentos.filter((p) => p.emprestimo_id === e.id);
          return (
            <div key={e.id} className="rounded-xl border border-border bg-card p-3">
              <button onClick={() => setAberto(aberto === e.id ? null : e.id)} className="w-full text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{e.credor}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.descricao}</p>
                  </div>
                  <span className={`shrink-0 text-sm font-semibold ${quitado ? "text-income" : "text-expense"}`}>
                    {quitado ? "Quitado ✓" : brl(Number(e.saldo_devedor))}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-income" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pct.toFixed(0)}% pago · {brl(Number(e.total_pago))} de {brl(orig)}
                </p>
              </button>
              {aberto === e.id && (
                <div className="mt-3 border-t border-border pt-3">
                  {!quitado && (
                    <form onSubmit={(ev) => { ev.preventDefault(); if (Number(valorPag.replace(",", ".")) > 0) pagM.mutate(e.id); }} className="flex gap-2">
                      <input inputMode="decimal" placeholder="Valor pago hoje" value={valorPag} onChange={(ev) => setValorPag(ev.target.value)} className={inputCls} />
                      <button disabled={pagM.isPending} className="shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">Pagar</button>
                    </form>
                  )}
                  <div className="mt-2 flex flex-col gap-1">
                    {pags.map((p) => (
                      <div key={p.id} className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatData(p.data)}</span><span>{brl(Number(p.valor))}</span>
                      </div>
                    ))}
                    {pags.length === 0 && <p className="text-xs text-muted-foreground">Nenhum pagamento registrado.</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
