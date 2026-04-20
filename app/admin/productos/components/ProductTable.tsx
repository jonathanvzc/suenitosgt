"use client";

import { Pencil, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import SmartImage from "@/components/SmartImage";

export default function ProductTable({
  productos,
  onEdit,
  onDelete,
  onNew,
}: any) {
  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Productos
        </h2>

        <button
          onClick={onNew}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-200 text-gray-900">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Imagen</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Subcategoría</th>
              <th className="p-3">Precio</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productos.map((p: any) => (
              <tr
                key={p.id}
                className="border-t hover:bg-gray-50 text-gray-900"
              >
                <td className="p-2 font-bold">{p.id}</td>

                <td className="p-2">
                    <SmartImage
                      src={p.imagen_url}
                      alt={p.nombre}
                      width={56}
                      height={56}
                      className="rounded object-cover"
                    />
                </td>

                <td className="p-2">{p.nombre}</td>

                <td className="p-2">
                  {p.categorias?.nombre || "-"}
                </td>

                <td className="p-2">
                  {p.subcategorias?.nombre || "-"}
                </td>

                <td className="p-2 text-green-600 font-bold">
                  Q{p.precio}
                </td>

                <td className="p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => onEdit(p)}
                    className="bg-blue-500 p-2 rounded text-white hover:bg-blue-600"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(p.id)}
                    className="bg-red-500 p-2 rounded text-white hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}