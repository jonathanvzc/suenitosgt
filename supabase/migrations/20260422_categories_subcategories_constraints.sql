create unique index if not exists categorias_id_key
  on public.categorias (id);

alter table if exists public.categorias
  drop constraint if exists categorias_pkey;

alter table if exists public.categorias
  add constraint categorias_pkey primary key (id, nombre);

create unique index if not exists subcategorias_id_key
  on public.subcategorias (id);

create index if not exists subcategorias_categoria_id_idx
  on public.subcategorias (categoria_id);

alter table if exists public.subcategorias
  drop constraint if exists subcategorias_pkey;

alter table if exists public.subcategorias
  add constraint subcategorias_pkey primary key (id, nombre, categoria_id);

alter table if exists public.subcategorias
  drop constraint if exists subcategorias_categoria_id_fkey;

alter table if exists public.subcategorias
  add constraint subcategorias_categoria_id_fkey
  foreign key (categoria_id)
  references public.categorias (id)
  on update cascade
  on delete restrict;
