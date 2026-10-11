export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const mesAno = (isoDate: string) =>
  `${isoDate.slice(5, 7)}/${isoDate.slice(0, 4)}`;

export const formatData = (isoDate: string) => {
  const [y, m, d] = isoDate.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Máscara de moeda: os dígitos digitados entram pelos centavos (1250 → "12,50"). */
export const mascaraMoeda = (raw: string) => {
  const d = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (!d) return "";
  return (Number(d) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
export const parseMoeda = (s: string) => Number(s.replace(/\D/g, "") || "0") / 100;
