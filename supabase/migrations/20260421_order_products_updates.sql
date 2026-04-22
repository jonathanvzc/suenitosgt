alter table if exists public.productos
  add column if not exists observaciones text;

alter table if exists public.pedidos
  add column if not exists estado text default 'pendiente';

create unique index if not exists pedidos_numero_orden_key
  on public.pedidos (numero_orden);

create or replace function public.assign_order_number(p_pedido_id bigint)
returns text
language plpgsql
security definer
as $$
declare
  generated_order text;
begin
  select format(
    'ORD-%s-%s-%s',
    to_char(coalesce(created_at, now()), 'YYYY'),
    to_char(coalesce(created_at, now()), 'MM'),
    lpad(id::text, 4, '0')
  )
  into generated_order
  from public.pedidos
  where id = p_pedido_id
  for update;

  update public.pedidos
  set numero_orden = generated_order
  where id = p_pedido_id;

  return generated_order;
end;
$$;
