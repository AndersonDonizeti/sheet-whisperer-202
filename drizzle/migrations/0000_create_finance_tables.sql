create table public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  data date not null,
  tipo text not null check (tipo in ('Receita','Despesa')),
  categoria text not null,
  descricao text default '',
  valor numeric(12,2) not null,
  plataforma text default '',
  obs text default '',
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.lancamentos to authenticated;
grant all on public.lancamentos to service_role;
alter table public.lancamentos enable row level security;
create policy "users manage own lancamentos" on public.lancamentos for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.gastos_fixos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  data date not null,
  categoria text not null,
  valor numeric(12,2) not null,
  mes_ano text default '',
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.gastos_fixos to authenticated;
grant all on public.gastos_fixos to service_role;
alter table public.gastos_fixos enable row level security;
create policy "users manage own gastos_fixos" on public.gastos_fixos for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.emprestimos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  descricao text not null,
  credor text not null,
  valor_original numeric(12,2) not null,
  total_pago numeric(12,2) default 0,
  saldo_devedor numeric(12,2) not null,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.emprestimos to authenticated;
grant all on public.emprestimos to service_role;
alter table public.emprestimos enable row level security;
create policy "users manage own emprestimos" on public.emprestimos for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  emprestimo_id uuid references public.emprestimos(id) on delete cascade not null,
  data date not null,
  valor numeric(12,2) not null,
  obs text default '',
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.pagamentos to authenticated;
grant all on public.pagamentos to service_role;
alter table public.pagamentos enable row level security;
create policy "users manage own pagamentos" on public.pagamentos for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);