"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toastConfirm, toastSuccess, toastError } from "@/lib/toast";
import ProductTable from "@/app/admin/productos/components/ProductTable";
import ProductModal from "@/app/admin/productos/components/ProductModal";
import type { FormProducto } from "@/types/producto";

// =========================
// TYPES
// =========================
type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria_id: number;
  subcategoria_id: number;
  video_url?: string;

  producto_imagenes?: {
    id: number;
    imagen_url: string;
  }[];
};

type Categoria = {
  id: number;
  nombre: string;
};

type Subcategoria = {
  id: number;
  nombre: string;
  categoria_id: number;
};

export default function Page() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState<FormProducto>({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: null,
    imagen_url: null,
    categoria_id: 0,
    subcategoria_id: 0,
    imagenes: [],
    video_url: "",
  });

  // =========================
  // LOAD DATA
  // =========================
  const initData = async () => {
    const [prod, cat, sub] = await Promise.all([
      supabase
        .from("productos")
        .select(`
          *,
          producto_imagenes (
            id,
            imagen_url
          )
        `)
        .is("deleted_at", null)
        .order("id", { ascending: false }),

      supabase.from("categorias").select("*"),
      supabase.from("subcategorias").select("*"),
    ]);

    setProductos((prod.data as Producto[]) || []);
    setCategorias((cat.data as Categoria[]) || []);
    setSubcategorias((sub.data as Subcategoria[]) || []);
  };

  useEffect(() => {
    initData();
  }, []);

  // =========================
  // UPLOAD IMAGE
  // =========================
  const uploadImage = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toastError("Imagen muy pesada (máx 2MB)");
      return null;
    }

    if (!file.type.startsWith("image/")) {
      toastError("Archivo inválido");
      return null;
    }

    const extension = file.name.split(".").pop();
    const fileName = `${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      toastError("Error subiendo imagen");
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // =========================
  // SAVE
  // =========================
  const handleSave = async () => {
    if (!form.nombre || !form.precio) {
      toastError("Completa los campos");
      return;
    }

    let imageUrl = form.imagen_url;

    // Imagen principal
    if (form.imagen) {
      const url = await uploadImage(form.imagen);
      if (url) imageUrl = url;
    }

    let productoId = editId;

    // =========================
    // CREATE / UPDATE
    // =========================
    if (editId) {
      await supabase
        .from("productos")
        .update({
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: Number(form.precio),
          categoria_id: form.categoria_id,
          subcategoria_id: form.subcategoria_id,
          imagen_url: imageUrl,
          video_url: form.video_url || null,
        })
        .eq("id", editId);

      productoId = editId;

      toastSuccess("Producto actualizado");
    } else {
      const { data } = await supabase
        .from("productos")
        .insert([
          {
            nombre: form.nombre,
            descripcion: form.descripcion,
            precio: Number(form.precio),
            categoria_id: form.categoria_id,
            subcategoria_id: form.subcategoria_id,
            imagen_url: imageUrl,
            video_url: form.video_url || null,
          },
        ])
        .select()
        .single();

      productoId = data?.id;

      toastSuccess("Producto creado");
    }

    // =========================
    // GUARDAR IMÁGENES MÚLTIPLES
    // =========================
    if (productoId && form.imagenes && form.imagenes.length > 0) {
      // borrar anteriores
      await supabase
        .from("producto_imagenes")
        .delete()
        .eq("producto_id", productoId);

      // insertar nuevas
      const nuevas = form.imagenes.map((img) => ({
        producto_id: productoId,
        imagen_url: img.imagen_url,
      }));

      await supabase.from("producto_imagenes").insert(nuevas);
    }

    cerrarModal();
    initData();
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (p: Producto) => {
    setEditId(p.id);

    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: String(p.precio),
      imagen: null,
      imagen_url: p.imagen_url || null,
      categoria_id: p.categoria_id || 0,
      subcategoria_id: p.subcategoria_id || 0,

      // 🔥 CLAVE
      imagenes: p.producto_imagenes || [],
      video_url: p.video_url || "",
    });

    setOpenModal(true);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = (id: number) => {
    toastConfirm({
      message: "¿Eliminar producto?",
      onConfirm: () => ejecutarDelete(id),
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      type: "danger",
    });
  };

  const ejecutarDelete = async (id: number) => {
    const { error } = await supabase
      .from("productos")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toastError("Error al eliminar");
    } else {
      toastSuccess("Producto eliminado");
      initData();
    }
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const cerrarModal = () => {
    setEditId(null);

    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      imagen: null,
      imagen_url: null,
      categoria_id: 0,
      subcategoria_id: 0,
      imagenes: [],
      video_url: "",
    });

    setOpenModal(false);
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