"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function ProductImagesManager({
  productoId,
  imagenes,
  onChange,
}: any) {
  const [loading, setLoading] = useState(false);

  const upload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Máx 2MB");
      return;
    }

    if (!file.type.includes("image")) {
      toast.error("Archivo inválido");
      return;
    }

    setLoading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) {
      toast.error("Error subiendo");
      setLoading(false);
      return;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    const { data: newImg } = await supabase
      .from("producto_imagenes")
      .insert([{ producto_id: productoId, imagen_url: url }])
      .select()
      .single();

    onChange([...imagenes, newImg]);

    setLoading(false);
    toast.success("Imagen agregada");
  };

  const eliminar = async (id: number) => {
    await supabase.from("producto_imagenes").delete().eq("id", id);
    onChange(imagenes.filter((i: any) => i.id !== id));
  };

  return (
    <div>
      <p className="font-semibold mb-2">Imágenes</p>

      <input
        type="file"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            upload(e.target.files[0]);
          }
        }}
      />

      <div className="grid grid-cols-3 gap-2 mt-3">
        {imagenes.map((img: any) => (
          <div key={img.id} className="relative">
            <img src={img.imagen_url} className="h-20 w-full object-cover rounded" />
            <button
              onClick={() => eliminar(img.id)}
              className="absolute top-1 right-1 bg-red-500 text-white px-1 text-xs"
            >
              X
            </button>
          </div>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-500">Subiendo...</p>}
    </div>
  );
}