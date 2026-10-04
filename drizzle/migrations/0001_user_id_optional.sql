ALTER TABLE public.lancamentos ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.gastos_fixos ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.emprestimos ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.pagamentos ALTER COLUMN user_id DROP NOT NULL;