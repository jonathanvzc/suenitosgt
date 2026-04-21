"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProductTallasManager({
  productoId,
  tallas,
  onChange,
}: any) {
  const [talla, setTalla] = useState("");
  const [stock, setStock] = useState("");

  const agregar = async () => {
    if (!talla) return;

    const { data } = await supabase
      .from("producto_tallas")
      .insert([
        {
          producto_id: productoId,
          talla,
          stock: Number(stock) || 0,
        },
      ])
      .select()
      .single();

    onChange([...tallas, data]);
    setTalla("");
    setStock("");
  };

  const eliminar = async (id: number) => {
    await supabase.from("producto_tallas").delete().eq("id", id);
    onChange(tallas.filter((t: any) => t.id !== id));
  };

  return (
    <div>
      <p className="font-semibold mb-2">Tallas</p>

      <div className="flex gap-2">
        <input
          placeholder="Ej: S, M, 32"
          value={talla}
          onChange={(e) => setTalla(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="border p-2 rounded w-20"
        />
        <button
          onClick={agregar}
          className="bg-green-600 text-white px-3 rounded"
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {tallas.map((t: any) => (
          <div
            key={t.id}
            className="px-3 py-1 bg-gray-200 rounded flex items-center gap-2"
          >
            {t.talla} ({t.stock})
            <button onClick={() => eliminar(t.id)}>x</button>
          </div>
        ))}
      </div>
    </div>
  );
}