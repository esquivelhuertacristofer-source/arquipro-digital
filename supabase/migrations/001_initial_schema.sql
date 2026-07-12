-- =============================================================================
-- ArquiPro Digital — Schema inicial de Supabase
-- Ejecuta este script en:  Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLA DE PERFILES (extiende auth.users con datos extra)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  name        text        not null default '',
  phone       text        not null default '',
  profession  text        not null default 'Arquitecto',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: crear perfil automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, profession)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'Arquitecto'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. TABLA DE ÓRDENES / COMPRAS
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        references auth.users(id) on delete set null,
  product_id      text        not null,
  product_name    text        not null,
  price           numeric(10,2) not null,
  status          text        not null default 'pending'
                              check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  mp_payment_id   text,        -- ID de pago devuelto por MercadoPago
  mp_preference_id text,       -- ID de la preferencia MP (opcional)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_user_id_idx  on public.orders(user_id);
create index if not exists orders_status_idx   on public.orders(status);
create index if not exists orders_mp_pay_idx   on public.orders(mp_payment_id);

-- Trigger: actualizar updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.orders   enable row level security;

-- Profiles: solo el propio usuario puede ver y editar su perfil
create policy "Usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuarios editan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Orders: usuario ve solo sus propias órdenes
create policy "Usuarios ven sus propias órdenes"
  on public.orders for select
  using (auth.uid() = user_id);

-- Inserción/actualización de órdenes solo desde el servidor (Edge Functions / service_role)
-- El frontend NO puede insertar órdenes directamente (seguridad)
create policy "Solo service_role puede insertar órdenes"
  on public.orders for insert
  with check (auth.role() = 'service_role');

create policy "Solo service_role puede actualizar órdenes"
  on public.orders for update
  using (auth.role() = 'service_role');

-- =============================================================================
-- NOTA: En Supabase Storage, crea un bucket PRIVADO llamado "resources"
-- y sube ahí los archivos ZIP/XLSX con los mismos nombres que están en dashboard.js.
-- El frontend genera signed URLs de 60 segundos que expiran automáticamente.
-- =============================================================================
