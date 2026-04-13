import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    // =========================
    // SUPABASE SSR CLIENT (CORRECTO)
    // =========================
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // route handler (no-op)
          },
        },
      }
    );

    // =========================
    // AUTH CHECK
    // =========================
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    // =========================
    // BODY
    // =========================
    const body = await req.json();
    const { nombre, telefono, direccion, horario, carrito } = body;

    // =========================
    // VALIDACIONES PRO
    // =========================
    if (!nombre || !telefono || !direccion) {
      return NextResponse.json(
        { success: false, message: "Campos obligatorios incompletos" },
        { status: 400 }
      );
    }

    if (!/^[0-9]{8}$/.test(telefono)) {
      return NextResponse.json(
        { success: false, message: "Teléfono inválido (8 dígitos)" },
        { status: 400 }
      );
    }

    if (!Array.isArray(carrito) || carrito.length === 0) {
      return NextResponse.json(
        { success: false, message: "Carrito vacío" },
        { status: 400 }
      );
    }

    // =========================
    // TOTAL
    // =========================
    const total = carrito.reduce(
      (acc: number, p: any) => acc + p.precio * p.cantidad,
      0
    );

    // =========================
    // INSERT PEDIDO
    // =========================
    const { data: pedido, error } = await supabase
      .from("pedidos")
      .insert([
        {
          nombre,
          telefono,
          direccion,
          horario,
          total,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // =========================
    // DETALLES
    // =========================
    const detalles = carrito.map((p: any) => ({
      pedido_id: pedido.id,
      producto_id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
      subtotal: p.precio * p.cantidad,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_pedido")
      .insert(detalles);

    if (detalleError) {
      return NextResponse.json(
        { success: false, message: detalleError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pedido,
      total,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error interno" },
      { status: 500 }
    );
  }
}