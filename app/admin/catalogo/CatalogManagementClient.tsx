"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toastConfirm, toastError, toastSuccess } from "@/lib/toast";
import type { Categoria, Subcategoria } from "@/types/producto";

type CategoriaForm = {
  id: number | null;
  nombre: string;
  orden: string;
};

type SubcategoriaForm = {
  id: number | null;
  nombre: string;
  categoria_id: string;
};

type Props = {
  mode: "categorias" | "subcategorias";
};

const emptyCategoriaForm: CategoriaForm = {
  id: null,
  nombre: "",
  orden: "0",
};

const emptySubcategoriaForm: SubcategoriaForm = {
  id: null,
  nombre: "",
  categoria_id: "",
};

export default function CatalogManagementClient({ mode }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categoriaForm, setCategoriaForm] = useState<CategoriaForm>(emptyCategoriaForm);
  const [subcategoriaForm, setSubcategoriaForm] = useState<SubcategoriaForm>(emptySubcategoriaForm);
  const [categoriaFiltroSubcategoria, setCategoriaFiltroSubcategoria] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [subcategoriaModalOpen, setSubcategoriaModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [categoriasRes, subcategoriasRes] = await Promise.all([
        fetch("/api/categorias"),
        fetch("/api/subcategorias"),
      ]);

      const categoriasJson = await categoriasRes.json();
      const subcategoriasJson = await subcategoriasRes.json();

      setCategorias(categoriasJson.data || []);
      setSubcategorias(subcategoriasJson.data || []);
    } catch {
      toastError("No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const subcategoriasFiltradas = useMemo(() => {
    if (!categoriaFiltroSubcategoria) {
      return [];
    }

    return subcategorias
      .filter((item) => String(item.categoria_id) === categoriaFiltroSubcategoria)
      .sort((a, b) => a.id - b.id);
  }, [categoriaFiltroSubcategoria, subcategorias]);

  const categoriaActiva = useMemo(
    () => categorias.find((item) => String(item.id) === categoriaFiltroSubcategoria) || null,
    [categoriaFiltroSubcategoria, categorias]
  );

  const categoriaNombre = (categoriaId: number) =>
    categorias.find((item) => item.id === categoriaId)?.nombre || "Sin categoría";

  const openCreateCategoriaModal = () => {
    setCategoriaForm(emptyCategoriaForm);
    setCategoriaModalOpen(true);
  };

  const openEditCategoriaModal = (categoria: Categoria) => {
    setCategoriaForm({
      id: categoria.id,
      nombre: categoria.nombre,
      orden: String(categoria.orden || 0),
    });
    setCategoriaModalOpen(true);
  };

  const closeCategoriaModal = () => {
    setCategoriaForm(emptyCategoriaForm);
    setCategoriaModalOpen(false);
  };

  const openCreateSubcategoriaModal = () => {
    if (!categoriaFiltroSubcategoria) {
      toastError("Selecciona una categoría primero");
      return;
    }

    setSubcategoriaForm({
      ...emptySubcategoriaForm,
      categoria_id: categoriaFiltroSubcategoria,
    });
    setSubcategoriaModalOpen(true);
  };

  const openEditSubcategoriaModal = (subcategoria: Subcategoria) => {
    setSubcategoriaForm({
      id: subcategoria.id,
      nombre: subcategoria.nombre,
      categoria_id: String(subcategoria.categoria_id),
    });
    setSubcategoriaModalOpen(true);
  };

  const closeSubcategoriaModal = () => {
    setSubcategoriaForm({
      ...emptySubcategoriaForm,
      categoria_id: categoriaFiltroSubcategoria,
    });
    setSubcategoriaModalOpen(false);
  };

  const submitCategoria = async () => {
    if (!categoriaForm.nombre.trim()) {
      toastError("Ingresa el nombre de la categoría");
      return;
    }

    const response = await fetch("/api/categorias", {
      method: categoriaForm.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: categoriaForm.id,
        nombre: categoriaForm.nombre,
        orden: Number(categoriaForm.orden || 0),
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      toastError(result.message || "No se pudo guardar la categoría");
      return;
    }

    closeCategoriaModal();
    toastSuccess(categoriaForm.id ? "Categoría actualizada" : "Categoría creada");
    await loadData();
  };

  const submitSubcategoria = async () => {
    if (!subcategoriaForm.nombre.trim() || !subcategoriaForm.categoria_id) {
      toastError("Completa nombre y categoría");
      return;
    }

    const response = await fetch("/api/subcategorias", {
      method: subcategoriaForm.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: subcategoriaForm.id,
        nombre: subcategoriaForm.nombre,
        categoria_id: Number(subcategoriaForm.categoria_id),
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      toastError(result.message || "No se pudo guardar la subcategoría");
      return;
    }

    closeSubcategoriaModal();
    toastSuccess(subcategoriaForm.id ? "Subcategoría actualizada" : "Subcategoría creada");
    await loadData();
  };

  const deleteCategoria = (id: number) => {
    toastConfirm({
      message: "¿Eliminar categoría?",
      type: "danger",
      onConfirm: async () => {
        const response = await fetch("/api/categorias", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          toastError(result.message || "No se pudo eliminar la categoría");
          return;
        }

        toastSuccess("Categoría eliminada");
        await loadData();
      },
    });
  };

  const deleteSubcategoria = (id: number) => {
    toastConfirm({
      message: "¿Eliminar subcategoría?",
      type: "danger",
      onConfirm: async () => {
        const response = await fetch("/api/subcategorias", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          toastError(result.message || "No se pudo eliminar la subcategoría");
          return;
        }

        toastSuccess("Subcategoría eliminada");
        await loadData();
      },
    });
  };

  const renderHeaderCard = (
    title: string,
    subtitle: string,
    count: string | number,
    helper: string
  ) => (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
        {title}
      </p>
      <p className="mt-2 text-3xl font-black text-gray-900">{count}</p>
      <p className="mt-1 text-sm font-medium text-gray-700">{subtitle}</p>
      <p className="mt-1 text-sm text-gray-500">{helper}</p>
    </div>
  );

  if (mode === "categorias") {
    return (
      <>
        <div className="space-y-8 p-2">
          <section className="rounded-[32px] border border-green-100 bg-gradient-to-r from-green-50 via-white to-emerald-50 p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
                  Administración
                </p>
                <h1 className="mt-2 text-3xl font-black text-gray-900">CRUD de categorías</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">
                  Mantén el catálogo principal con una experiencia más clara, ordenada y
                  visualmente consistente.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/admin/subcategorias"
                  className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Ir a subcategorías
                </Link>
                <button
                  onClick={openCreateCategoriaModal}
                  className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Crear categoría
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {renderHeaderCard(
                "Total",
                "Categorías activas",
                categorias.length,
                "Controla la navegación principal de la tienda."
              )}
              {renderHeaderCard(
                "Estado",
                loading ? "Sincronizando" : "Actualizado",
                loading ? "..." : "OK",
                "Los cambios se reflejan en tienda y panel."
              )}
              {renderHeaderCard(
                "Enfoque",
                "Orden visual",
                "UX",
                "Usa el campo orden para priorizar la exhibición."
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">Listado de categorías</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Crea, edita y elimina categorías del catálogo principal.
                </p>
              </div>
              {loading && <span className="text-sm text-gray-400">Actualizando...</span>}
            </div>

            <div className="mt-5 space-y-3">
              {categorias.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                  No hay categorías creadas todavía.
                </div>
              )}

              {categorias.map((categoria) => (
                <article
                  key={`${categoria.id}-${categoria.nombre}`}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{categoria.nombre}</p>
                    <p className="text-sm text-gray-500">
                      ID: {categoria.id} · Orden: {categoria.orden || 0}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditCategoriaModal(categoria)}
                      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteCategoria(categoria.id)}
                      className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {categoriaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[30px] border border-gray-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
                    Categoría
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-gray-900">
                    {categoriaForm.id ? "Modificar categoría" : "Crear categoría"}
                  </h2>
                </div>

                <button
                  onClick={closeCategoriaModal}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nombre
                  </label>
                  <input
                    value={categoriaForm.nombre}
                    onChange={(e) =>
                      setCategoriaForm((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Orden
                  </label>
                  <input
                    value={categoriaForm.orden}
                    onChange={(e) =>
                      setCategoriaForm((prev) => ({ ...prev, orden: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeCategoriaModal}
                  className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void submitCategoria()}
                  className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  {categoriaForm.id ? "Guardar cambios" : "Crear categoría"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-8 p-2">
        <section className="rounded-[32px] border border-green-100 bg-gradient-to-r from-green-50 via-white to-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
                Administración
              </p>
              <h1 className="mt-2 text-3xl font-black text-gray-900">CRUD de subcategorías</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Filtra por categoría, consulta el grupo actual y administra cada
                subcategoría desde una pantalla más amigable.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin/categorias"
                className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Ir a categorías
              </Link>
              <button
                onClick={openCreateSubcategoriaModal}
                className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Crear subcategoría
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {renderHeaderCard(
              "Categorías",
              "Bases disponibles",
              categorias.length,
              "Selecciona una para trabajar sus subcategorías."
            )}
            {renderHeaderCard(
              "Subcategorías",
              "Total registradas",
              subcategorias.length,
              "Vista global del catálogo secundario."
            )}
            {renderHeaderCard(
              "Categoría activa",
              categoriaActiva?.nombre || "Sin seleccionar",
              categoriaActiva ? subcategoriasFiltradas.length : "--",
              categoriaActiva
                ? "Subcategorías visibles en esta categoría."
                : "Elige una categoría para comenzar."
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-gray-900">Mantenimiento por categoría</h2>
            <p className="mt-2 text-sm text-gray-500">
              Selecciona una categoría para mostrar las subcategorías configuradas y
              administrarlas sin mezclar información.
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,360px)_1fr]">
            <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Categoría a administrar
              </label>
              <select
                value={categoriaFiltroSubcategoria}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoriaFiltroSubcategoria(value);
                  setSubcategoriaForm((prev) => ({ ...prev, categoria_id: value }));
                }}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
              >
                <option value="">Selecciona categoría</option>
                {categorias.map((categoria) => (
                  <option key={`${categoria.id}-${categoria.nombre}`} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>

              <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                  Contexto
                </p>
                <p className="mt-2 text-lg font-bold text-gray-900">
                  {categoriaActiva?.nombre || "Selecciona una categoría"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {categoriaActiva
                    ? "Verás las subcategorías actuales y podrás crear nuevas sin salir de esta vista."
                    : "Primero elige una categoría para mostrar sus registros."}
                </p>
              </div>
            </div>

            <div>
              {categoriaFiltroSubcategoria ? (
                <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Subcategorías de {categoriaNombre(Number(categoriaFiltroSubcategoria))}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Aquí puedes crear nuevas subcategorías, editar o eliminar las existentes.
                      </p>
                    </div>

                    <button
                      onClick={openCreateSubcategoriaModal}
                      className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Nueva subcategoría
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {subcategoriasFiltradas.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
                        Esta categoría aún no tiene subcategorías.
                      </div>
                    )}

                    {subcategoriasFiltradas.map((subcategoria) => (
                      <article
                        key={`${subcategoria.id}-${subcategoria.nombre}-${subcategoria.categoria_id}`}
                        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{subcategoria.nombre}</p>
                          <p className="text-sm text-gray-500">
                            ID: {subcategoria.id} · Categoría: {categoriaNombre(subcategoria.categoria_id)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditSubcategoriaModal(subcategoria)}
                            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteSubcategoria(subcategoria.id)}
                            className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                  Selecciona una categoría para mostrar sus subcategorías actuales.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {subcategoriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[30px] border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
                  Subcategoría
                </p>
                <h2 className="mt-2 text-2xl font-black text-gray-900">
                  {subcategoriaForm.id ? "Modificar subcategoría" : "Crear subcategoría"}
                </h2>
              </div>

              <button
                onClick={closeSubcategoriaModal}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Categoría
                </label>
                <select
                  value={subcategoriaForm.categoria_id}
                  onChange={(e) =>
                    setSubcategoriaForm((prev) => ({ ...prev, categoria_id: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
                >
                  <option value="">Selecciona categoría</option>
                  {categorias.map((categoria) => (
                    <option key={`${categoria.id}-${categoria.nombre}`} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nombre
                </label>
                <input
                  value={subcategoriaForm.nombre}
                  onChange={(e) =>
                    setSubcategoriaForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeSubcategoriaModal}
                className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => void submitSubcategoria()}
                className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                {subcategoriaForm.id ? "Guardar cambios" : "Crear subcategoría"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
