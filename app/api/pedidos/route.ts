import { NextResponse } from "next/server";
import supabase from "../../../lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const { nombre, telefono, direccion, horario, carrito } = body;

  // 1. Calcular total
  const total = carrito.reduce(
    (acc: number, p: any) => acc + p.precio * p.cantidad,
    0
  );

  // 2. Insertar pedido
  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert([
      {
        nombre,
        telefono,
        direccion,
        horario,
        total,
      },
    ])
    .select()
    .single();

if (error) {
  console.error("ERROR PEDIDO:", error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}

  // 3. Insertar detalle
  const detalles = carrito.map((p: any) => ({
    pedido_id: pedido.id,
    producto_id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    cantidad: p.cantidad,
    subtotal: p.precio * p.cantidad,
  }));

  await supabase.from("detalle_pedido").insert(detalles);

  return NextResponse.json({ success: true, pedido });
}