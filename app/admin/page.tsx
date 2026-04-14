"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

import ProductTable from "./productos/components/ProductTable";
import ProductModal from "./productos/components/ProductModal";

export default function Page() {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: null as File | null,
    imagen_url: "", 
    categoria_id: 0,
    subcategoria_id: 0,
  });

  const [preview, setPreview] = useState<string | null>(null);

  // =========================
  // LOAD DATA
  // =========================
  const initData = async () => {
    const [prod, cat, sub] = await Promise.all([
      supabase
        .from("productos")
        .select(`
          *,
          categorias (nombre),
          subcategorias (nombre)
        `)
        .is("deleted_at", null)
        .order("id", { ascending: false }),

      supabase.from("categorias").select("*"),
      supabase.from("subcategorias").select("*"),
    ]);

    setProductos(prod.data || []);
    setCategorias(cat.data || []);
    setSubcategorias(sub.data || []);
  };

  useEffect(() => {
    initData();
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
      toast.error("Error subiendo imagen");
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // =========================
  // SAVE (FIX TOTAL)
  // =========================
  const handleSave = async () => {
    if (!form.nombre || !form.precio) {
      toast.error("Completa los campos");
      return;
    }

    let imageUrl = preview || "";

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

      toast.success("Producto actualizado");
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

      toast.success("Producto creado");
    }

    cerrarModal();
    initData();
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (p: any) => {
    setEditId(p.id);

      setForm({
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: String(p.precio),
        imagen: null,
        imagen_url: p.imagen_url || "", // ✅
        categoria_id: p.categoria_id || 0,
        subcategoria_id: p.subcategoria_id || 0,
      });

    setPreview(p.imagen_url); // ✅ CORRECTO
    setOpenModal(true);
  };

  // =========================
  // DELETE (PRO con toast)
  // =========================
  const handleDelete = (id: number) => {
    toast((t) => (
      <div className="text-center">
        <p className="mb-3 font-semibold">¿Eliminar producto?</p>

        <div className="flex justify-center gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);

              await supabase
                .from("productos")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);

              toast.success("Producto eliminado");
              initData();
            }}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Sí
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            No
          </button>
        </div>
      </div>
    ));
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
      imagen_url: "", 
      categoria_id: 0,
      subcategoria_id: 0,
    });

    setPreview(null);
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