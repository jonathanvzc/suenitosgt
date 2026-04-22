// Tabla administrativa de productos con acciones rapidas de edicion y eliminacion.
"use client";

import SmartImage from "@/components/SmartImage";
import type { Producto, ProductoImagen, ProductoTalla } from "@/types/producto";

type ProductoAdmin = Producto & {
  categorias?: {
    nombre: string;
  } | null;
  subcategorias?: {
    nombre: string;
  } | null;
  producto_imagenes?: ProductoImagen[];
  producto_tallas?: ProductoTalla[];
};

type Props = {
  productos: ProductoAdmin[];
  onEdit: (producto: ProductoAdmin) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
};

export default function ProductTable({
  productos,
  onEdit,
  onDelete,
  onNew,
}: Props) {
  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
            Catálogo
          </p>
          <h2 className="mt-2 text-3xl font-black text-gray-900">
            Gestión de productos
          </h2>
        </div>

        <button
          onClick={onNew}
          className="rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Nuevo producto
        </button>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Subcategoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Extras</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr
                  key={producto.id}
                  className="border-t border-gray-200 text-gray-800"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SmartImage
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                      <div>
                        <p className="font-semibold">{producto.nombre}</p>
                        <p className="text-xs text-gray-500">ID {producto.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{producto.categorias?.nombre || "-"}</td>
                  <td className="px-4 py-3">{producto.subcategorias?.nombre || "-"}</td>
                  <td className="px-4 py-3 font-bold text-green-600">
                    Q{producto.precio}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                        {producto.producto_imagenes?.length || 0} imágenes
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                        {producto.producto_tallas?.length || 0} tallas
                      </span>
                      {producto.video_url && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                          Video
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(producto)}
                        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(producto.id)}
                        className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
