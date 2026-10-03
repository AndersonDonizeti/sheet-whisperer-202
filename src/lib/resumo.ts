type L = { data: string; tipo: string; valor: number | string; plataforma?: string | null };
type G = { data: string; valor: number | string };

export type ResumoMes = { mes: number; uber: number; n99: number; outros: number; receita: number; despesa: number; fixos: number };

/** Mesma lógica da aba "Resumo Mensal": receitas por plataforma e despesas de lançamentos; gastos fixos à parte. */
export function resumoMensal(lancamentos: L[], gastos: G[], ano: string): ResumoMes[] {
  const meses: ResumoMes[] = Array.from({ length: 12 }, (_, mes) => ({ mes, uber: 0, n99: 0, outros: 0, receita: 0, despesa: 0, fixos: 0 }));
  for (const l of lancamentos) {
    if (l.data.slice(0, 4) !== ano) continue;
    const m = meses[Number(l.data.slice(5, 7)) - 1]!;
    const v = Number(l.valor);
    if (l.tipo === "Receita") {
      m.receita += v;
      if (l.plataforma === "Uber") m.uber += v;
      else if (l.plataforma === "99") m.n99 += v;
      else m.outros += v;
    } else m.despesa += v;
  }
  for (const g of gastos) {
    if (g.data.slice(0, 4) !== ano) continue;
    meses[Number(g.data.slice(5, 7)) - 1]!.fixos += Number(g.valor);
  }
  return meses;
}
