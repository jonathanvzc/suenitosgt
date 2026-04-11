"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  // ✅ PRIMERO DECLARAR
  const cargar = async () => {
    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    setPedidos(data || []);
  };

  // ✅ DESPUÉS USAR
  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pedidos</h1>

      <div className="space-y-3">
        {pedidos.map((p) => (
          <div key={p.id} className="p-4 bg-white shadow rounded">
            <p><b>Cliente:</b> {p.nombre}</p>
            <p><b>Total:</b> Q{p.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}