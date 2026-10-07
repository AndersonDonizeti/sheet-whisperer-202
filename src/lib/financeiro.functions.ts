import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Dono original dos dados importados da planilha (conta usada na importação).
// O primeiro usuário que entrar sem lançamentos assume esses dados (claimLegacyData).
const LEGACY_OWNER_ID = "e51e1f50-e065-477b-95c6-58728ae68f66";

export const getLancamentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("lancamentos")
      .select("*")
      .order("data", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const addLancamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        data: z.string(),
        tipo: z.enum(["Receita", "Despesa"]),
        categoria: z.string().min(1),
        descricao: z.string().default(""),
        valor: z.number().positive(),
        plataforma: z.string().default(""),
        obs: z.string().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("lancamentos")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLancamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("lancamentos")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getGastosFixos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("gastos_fixos")
      .select("*")
      .order("data", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const addGastoFixo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        data: z.string(),
        categoria: z.string().min(1),
        valor: z.number().positive(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const mesAno = `${data.data.slice(5, 7)}/${data.data.slice(0, 4)}`;
    const { error } = await context.supabase
      .from("gastos_fixos")
      .insert({ ...data, mes_ano: mesAno, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGastoFixo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("gastos_fixos")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCategoriasGastos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("categorias_gastos")
      .select("*")
      .order("nome", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

export const addCategoriaGasto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ nome: z.string().trim().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("categorias_gastos")
      .insert({ nome: data.nome, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCategoriaGasto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("categorias_gastos")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getEmprestimos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: emprestimos, error } = await context.supabase
      .from("emprestimos")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    const { data: pagamentos, error: e2 } = await context.supabase
      .from("pagamentos")
      .select("*")
      .order("data", { ascending: false });
    if (e2) throw new Error(e2.message);
    return { emprestimos, pagamentos };
  });

export const addEmprestimo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        descricao: z.string().min(1),
        credor: z.string().min(1),
        valor_original: z.number().positive(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("emprestimos").insert({
      ...data,
      total_pago: 0,
      saldo_devedor: data.valor_original,
      user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addPagamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        emprestimo_id: z.string(),
        data: z.string(),
        valor: z.number().positive(),
        obs: z.string().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("pagamentos")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    const { data: emp, error: e2 } = await context.supabase
      .from("emprestimos")
      .select("total_pago, valor_original")
      .eq("id", data.emprestimo_id)
      .single();
    if (e2) throw new Error(e2.message);
    const totalPago = Number(emp.total_pago) + data.valor;
    const { error: e3 } = await context.supabase
      .from("emprestimos")
      .update({
        total_pago: totalPago,
        saldo_devedor: Math.max(0, Number(emp.valor_original) - totalPago),
      })
      .eq("id", data.emprestimo_id);
    if (e3) throw new Error(e3.message);
    return { ok: true };
  });

/**
 * Primeiro acesso: se quem entrou não tem nenhum lançamento,
 * transfere para ele o histórico importado da planilha
 * (linhas da conta de importação). Roda uma vez por conta.
 */
export const claimLegacyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await context.supabase
      .from("lancamentos")
      .select("id", { count: "exact", head: true });
    if (count && count > 0) return { claimed: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tables = [
      "lancamentos",
      "gastos_fixos",
      "emprestimos",
      "pagamentos",
      "categorias_gastos",
    ] as const;
    for (const table of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .update({ user_id: context.userId })
        .eq("user_id", LEGACY_OWNER_ID);
      if (error) throw new Error(error.message);
    }
    return { claimed: true };
  });

export const importSeedData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await context.supabase
      .from("lancamentos")
      .select("id", { count: "exact", head: true });
    if (count && count > 0) return { imported: false };

    type SeedLanc = { data: string; tipo: "Receita" | "Despesa"; categoria: string; descricao: string; valor: number; plataforma: string; obs: string };
    type SeedGasto = { data: string; categoria: string; valor: number; mes_ano: string };
    type SeedEmp = { orig_id: number; descricao: string; credor: string; valor_original: number; total_pago: number; saldo_devedor: number };
    type SeedPag = { data: string; emp_orig_id: number; valor: number; obs: string };
    const seed = (await import("./seed-data.json")).default as unknown as {
      lancamentos: SeedLanc[];
      gastos_fixos: SeedGasto[];
      emprestimos: SeedEmp[];
      pagamentos: SeedPag[];
    };

    const chunk = <T,>(arr: T[], n: number) =>
      Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
        arr.slice(i * n, i * n + n),
      );

    for (const batch of chunk(seed.lancamentos, 200)) {
      const { error } = await context.supabase
        .from("lancamentos")
        .insert(batch.map((r) => ({ ...r, user_id: context.userId })));
      if (error) throw new Error(error.message);
    }
    for (const batch of chunk(seed.gastos_fixos, 200)) {
      const { error } = await context.supabase
        .from("gastos_fixos")
        .insert(batch.map((r) => ({ ...r, user_id: context.userId })));
      if (error) throw new Error(error.message);
    }
    const idMap = new Map<number, string>();
    for (const e of seed.emprestimos) {
      const { orig_id, ...rest } = e;
      const { data: inserted, error } = await context.supabase
        .from("emprestimos")
        .insert({ ...rest, user_id: context.userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      idMap.set(orig_id, inserted.id as string);
    }
    for (const batch of chunk(seed.pagamentos, 200)) {
      const rows = batch.flatMap((p) => {
        const { emp_orig_id, ...rest } = p;
        const empId = idMap.get(emp_orig_id);
        return empId ? [{ ...rest, emprestimo_id: empId, user_id: context.userId }] : [];
      });
      if (rows.length) {
        const { error } = await context.supabase.from("pagamentos").insert(rows);
        if (error) throw new Error(error.message);
      }
    }
    return { imported: true };
  });
