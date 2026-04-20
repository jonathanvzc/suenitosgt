"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toastConfirm, toastSuccess, toastError } from "@/lib/toast";
import ProductTable from "@/app/admin/productos/components/ProductTable";
import ProductModal from "@/app/admin/productos/components/ProductModal";
import toast, { Toast } from "react-hot-toast";
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
  });

  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  // =========================
  // LOAD DATA
  // =========================
  const initData = async () => {
    const [prod, cat, sub] = await Promise.all([
      supabase
        .from("productos")
        .select("*")
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
    const load = async () => {
      await initData();
    };
    load();
  }, []);

  // =========================
  // UPLOAD IMAGE
  // =========================
  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

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

    if (form.imagen) {
      const url = await uploadImage(form.imagen);
      if (url) imageUrl = url;
    }

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
        })
        .eq("id", editId);

      toastSuccess("Producto actualizado");
    } else {
      await supabase.from("productos").insert([
        {
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: Number(form.precio),
          categoria_id: form.categoria_id,
          subcategoria_id: form.subcategoria_id,
          imagen_url: imageUrl,
        },
      ]);

      toastSuccess("Producto creado");
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
    });

    setOpenModal(true);
  };

// =========================
// DELETE PRO (CONFIRM + UNDO)
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