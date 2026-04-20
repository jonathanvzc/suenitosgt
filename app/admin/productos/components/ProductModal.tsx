"use client";

import { useEffect, useState } from "react";
import { FormProducto } from "@/types/producto";


type Props = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  form: FormProducto;
  setForm: React.Dispatch<React.SetStateAction<FormProducto>>;
  categorias: any[];
  subcategorias: any[];
  editId: number | null;
};

export default function ProductModal({
  open,
  onClose,
  onSave,
  form,
  setForm,
  categorias,
  subcategorias,
  editId,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  // =========================
  // FILTRO SUBCATEGORIAS
  // =========================
  const subcategoriasFiltradas = subcategorias.filter(
    (s) => s.categoria_id === form.categoria_id
  );

  // =========================
  // PREVIEW IMAGEN
  // =========================
  useEffect(() => {
    if (form.imagen) {
      const url = URL.createObjectURL(form.imagen);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (editId && form.imagen === null && form.imagen_url) {
      setPreview(form.imagen_url);
      return;
    }

    setPreview(null);
  }, [form.imagen, form.imagen_url, editId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {editId ? "Editar Producto" : "Nuevo Producto"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT */}
          <div>

            {/* NOMBRE */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
                className="w-full border border-gray-600 rounded-lg p-2 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Ej: Camisa negra"
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                className="w-full border border-gray-600 rounded-lg p-2 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Descripción del producto"
              />
            </div>

            {/* PRECIO */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Precio (Q)
              </label>
              <input
                type="number"
                value={form.precio}
                onChange={(e) =>
                  setForm({ ...form, precio: e.target.value })
                }
                className="w-full border border-gray-600 rounded-lg p-2 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Ej: 150"
              />
            </div>

            {/* CATEGORIA */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Categoría
              </label>
              <select
                value={form.categoria_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categoria_id: Number(e.target.value),
                    subcategoria_id: 0,
                  })
                }
                className="w-full border border-gray-600 rounded-lg p-2 text-gray-800 bg-white focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value={0} className="text-gray-500">
                  Seleccione categoría
                </option>

                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBCATEGORIA */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Subcategoría
              </label>
              <select
                value={form.subcategoria_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subcategoria_id: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-600 rounded-lg p-2 text-gray-800 bg-white focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value={0} className="text-gray-500">
                  Seleccione subcategoría
                </option>

                {subcategoriasFiltradas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT - IMAGEN */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Imagen del producto
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition">

              {/* PREVIEW */}
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}

              {/* INPUT OCULTO */}
              <input
                id="upload-image"
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm({ ...form, imagen: file });
                }}
              />

              {/* BOTÓN */}
              <label
                htmlFor="upload-image"
                className="inline-block mt-2 cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Subir imagen
              </label>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            Cancelar
          </button>

          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {editId ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}