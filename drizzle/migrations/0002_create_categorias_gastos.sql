CREATE TABLE public.categorias_gastos (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid,
  nome text not null,
  created_at timestamp with time zone default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias_gastos TO authenticated;
GRANT ALL ON public.categorias_gastos TO service_role;
ALTER TABLE public.categorias_gastos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own categorias_gastos" ON public.categorias_gastos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);