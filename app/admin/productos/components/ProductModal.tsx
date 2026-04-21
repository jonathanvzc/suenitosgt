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
  // PREVIEW IMAGEN PRINCIPAL
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

  // =========================
  // AGREGAR IMAGEN GALERIA
  // =========================
  const handleAddImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      imagenes: [
        ...(prev.imagenes || []),
        {
          id: Date.now(),
          imagen_url: url,
          file,
        },
      ],
    }));
  };

  // =========================
  // ELIMINAR IMAGEN
  // =========================
  const removeImagen = (id: number) => {
    setForm((prev) => ({
      ...prev,
      imagenes: prev.imagenes?.filter((img) => img.id !== id) || [],
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editId ? "Editar Producto" : "Nuevo Producto"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-lg"
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
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
                className="w-full border border-gray-500 rounded-lg p-2 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                className="w-full border border-gray-500 rounded-lg p-2 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* PRECIO */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Precio (Q)
              </label>
              <input
                type="number"
                value={form.precio}
                onChange={(e) =>
                  setForm({ ...form, precio: e.target.value })
                }
                className="w-full border border-gray-500 rounded-lg p-2 text-gray-900 bg-white"
              />
            </div>

            {/* VIDEO */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Video (YouTube / Vimeo)
              </label>
              <input
                type="text"
                value={form.video_url || ""}
                onChange={(e) =>
                  setForm({ ...form, video_url: e.target.value })
                }
                className="w-full border border-gray-500 rounded-lg p-2 text-gray-900 bg-white"
                placeholder="https://youtube.com/..."
              />
            </div>

            {/* CATEGORIA */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-1">
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
                className="w-full border border-gray-500 rounded-lg p-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
              >
                <option value={0} className="text-gray-900">
                  Seleccione categoría
                </option>

                {categorias.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="text-gray-900 bg-white"
                  >
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBCATEGORIA */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-1">
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
                className="w-full border border-gray-500 rounded-lg p-2 bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
              >
                <option value={0} className="text-gray-900">
                  Seleccione subcategoría
                </option>

                {subcategoriasFiltradas.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    className="text-gray-900 bg-white"
                  >
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RIGHT */}
          <div>

            {/* IMAGEN PRINCIPAL */}
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Imagen principal
            </label>

            <div className="border-2 border-dashed border-gray-400 rounded-xl p-4 text-center mb-4">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-500">
                  Sin imagen
                </div>
              )}

              <input
                type="file"
                className="hidden"
                id="main-image"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm({ ...form, imagen: file });
                }}
              />

              <label
                htmlFor="main-image"
                className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700"
              >
                Subir imagen
              </label>
            </div>

            {/* GALERÍA */}
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Galería de imágenes
            </label>

            <div className="grid grid-cols-3 gap-2 mb-2">
              {form.imagenes?.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.imagen_url}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    onClick={() => removeImagen(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <input
              type="file"
              onChange={handleAddImagen}
              className="w-full text-sm text-gray-900 file:bg-green-600 file:text-white file:border-0 file:px-3 file:py-1 file:rounded file:mr-3"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
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