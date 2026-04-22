// CRUD administrativo de productos, imagenes, tallas y video con persistencia en Supabase.
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";
import { toastConfirm, toastError, toastSuccess } from "@/lib/toast";
import ProductModal from "@/app/admin/productos/components/ProductModal";
import ProductTable from "@/app/admin/productos/components/ProductTable";
import type { Categoria, FormProducto, Producto, ProductoImagen, ProductoTalla, Subcategoria } from "@/types/producto";

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

const emptyForm: FormProducto = {
  nombre: "",
  descripcion: "",
  precio: "",
  imagen: null,
  imagen_url: null,
  categoria_id: 0,
  subcategoria_id: null,
  observaciones: "",
  imagenes: [],
  tallas: [],
  video_url: "",
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [form, setForm] = useState<FormProducto>(emptyForm);
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const initData = async () => {
    const [prod, cat, sub] = await Promise.all([
      supabase
        .from("productos")
        .select(
          `
          *,
          categorias (nombre),
          subcategorias (nombre),
          producto_imagenes (id, imagen_url),
          producto_tallas (id, talla, stock)
        `
        )
        .is("deleted_at", null)
        .order("id", { ascending: false }),
      supabase.from("categorias").select("*").order("orden", { ascending: true }),
      supabase.from("subcategorias").select("*").order("orden", { ascending: true }),
    ]);

    setProductos((prod.data as ProductoAdmin[]) || []);
    setCategorias((cat.data as Categoria[]) || []);
    setSubcategorias((sub.data as Subcategoria[]) || []);
  };

  useEffect(() => {
    void (async () => {
      await initData();
    })();
  }, []);

  const persistProducto = async (payload: Record<string, unknown>) => {
    if (editId) {
      let response = await supabase.from("productos").update(payload).eq("id", editId);

      if (response.error?.message?.toLowerCase().includes("observaciones")) {
        const { observaciones, ...legacyPayload } = payload;
        void observaciones;
        response = await supabase.from("productos").update(legacyPayload).eq("id", editId);
      }

      return { id: editId, error: response.error };
    }

    let response = await supabase
      .from("productos")
      .insert([payload])
      .select("id")
      .single();

    if (response.error?.message?.toLowerCase().includes("observaciones")) {
      const { observaciones, ...legacyPayload } = payload;
      void observaciones;
      response = await supabase.from("productos").insert([legacyPayload]).select("id").single();
    }

    return {
      id: response.data?.id || null,
      error: response.error,
    };
  };

  const uploadImage = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toastError("Imagen muy pesada. Máximo 2MB");
      return null;
    }

    if (!file.type.startsWith("image/")) {
      toastError("Archivo inválido");
      return null;
    }

    const extension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await supabase.storage.from("product-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      toastError("No se pudo subir la imagen");
      return null;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const resolveGalleryImages = async () => {
    const urls: ProductoImagen[] = [];

    for (const imagen of form.imagenes) {
      if (imagen.file) {
        const uploaded = await uploadImage(imagen.file);

        if (!uploaded) {
          throw new Error("No se pudo subir una imagen de la galería");
        }

        urls.push({
          id: imagen.id,
          imagen_url: uploaded,
        });
      } else {
        urls.push(imagen);
      }
    }

    return urls;
  };

  const handleSave = async () => {
    try {
      if (!form.nombre.trim() || !form.precio || !form.categoria_id) {
        toastError("Completa nombre, precio y categoría");
        return;
      }

      let mainImageUrl = form.imagen_url;

      if (form.imagen) {
        const uploaded = await uploadImage(form.imagen);

        if (!uploaded) {
          return;
        }

        mainImageUrl = uploaded;
      }

      const gallery = await resolveGalleryImages();
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        observaciones: form.observaciones.trim() || null,
        precio: Number(form.precio),
        categoria_id: form.categoria_id,
        subcategoria_id: form.subcategoria_id || null,
        imagen_url: mainImageUrl,
        video_url: form.video_url.trim() || null,
      };

      let productoId = editId;

      const persistResult = await persistProducto(payload);

      if (persistResult.error) {
        throw persistResult.error;
      }

      productoId = persistResult.id;

      if (!productoId) {
        throw new Error("No se pudo resolver el ID del producto");
      }

      await supabase.from("producto_imagenes").delete().eq("producto_id", productoId);

      if (gallery.length > 0) {
        await supabase.from("producto_imagenes").insert(
          gallery.map((imagen) => ({
            producto_id: productoId,
            imagen_url: imagen.imagen_url,
          }))
        );
      }

      await supabase.from("producto_tallas").delete().eq("producto_id", productoId);

      if (form.tallas.length > 0) {
        await supabase.from("producto_tallas").insert(
          form.tallas.map((talla) => ({
            producto_id: productoId,
            talla: talla.talla,
            stock: 0,
          }))
        );
      }

      toastSuccess(editId ? "Producto actualizado" : "Producto creado");
      cerrarModal();
      initData();
    } catch (error) {
      toastError(getErrorMessage(error, "No se pudo guardar el producto"));
    }
  };

  const handleEdit = (producto: ProductoAdmin) => {
    setEditId(producto.id);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: String(producto.precio),
      imagen: null,
      imagen_url: producto.imagen_url || null,
      categoria_id: producto.categoria_id,
      subcategoria_id: producto.subcategoria_id || null,
      observaciones: producto.observaciones || "",
      imagenes: producto.producto_imagenes || [],
      tallas: producto.producto_tallas || [],
      video_url: producto.video_url || "",
    });
    setOpenModal(true);
  };

  const cerrarModal = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpenModal(false);
  };

  const handleDelete = (id: number) => {
    toastConfirm({
      message: "¿Eliminar producto?",
      type: "danger",
      onConfirm: async () => {
        const { error } = await supabase
          .from("productos")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);

        if (error) {
          toastError("No se pudo eliminar el producto");
          return;
        }

        toastSuccess("Producto eliminado");
        initData();
      },
    });
  };

  return (
    <>
      <ProductTable
        productos={productos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNew={() => setOpenModal(true)}
      />

      <ProductModal
        open={openModal}
        onClose={cerrarModal}
        onSave={handleSave}
        form={form}
        setForm={setForm}
        categorias={categorias}
        subcategorias={subcategorias}
        editId={editId}
      />
    </>
  );
}
