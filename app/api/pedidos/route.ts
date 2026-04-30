// API que valida el checkout invitado, guarda pedido y detalle, y genera el numero de orden.
import { apiError, apiSuccess } from "@/lib/api";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

type CartPayloadItem = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  talla?: string | null;
};

// Limpia texto ingresado por el usuario antes de persistirlo en la base de datos.
const sanitize = (value: string) => value.replace(/<[^>]*>?/gm, "").trim();

// Genera un número de orden legible si la función SQL todavía no está disponible.
const buildOrderNumber = (pedidoId: string | number, createdAt?: string | null) => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const rawSequence = String(pedidoId).replace(/\D/g, "");
  const sequence = (rawSequence || String(Date.now()).slice(-4)).slice(-4).padStart(4, "0");

  return `ORD-${year}-${month}-${sequence}`;
};

// Procesa el checkout invitado y registra pedido, detalle y número de orden de forma segura.
export async function POST(req: Request) {
  try {
    const supabase = createSupabaseAdmin();
    const body = await req.json();

    const nombre = sanitize(body?.nombre || "");
    const telefono = sanitize(body?.telefono || "");
    const direccion = sanitize(body?.direccion || "");
    const horario = sanitize(body?.horario || "");
    const carrito = Array.isArray(body?.carrito) ? (body.carrito as CartPayloadItem[]) : [];

    if (!nombre || !telefono || !direccion || !horario) {
      return apiError("Campos obligatorios incompletos", "Campos obligatorios incompletos", 400);
    }

    if (!/^[0-9]{8}$/.test(telefono)) {
      return apiError("Teléfono inválido", "Teléfono inválido", 400);
    }

    if (carrito.length === 0) {
      return apiError("El carrito está vacío", "El carrito está vacío", 400);
    }

    const productIds = [...new Set(carrito.map((item) => item.id))];
    const { data: tallasData, error: tallasError } = await supabase
      .from("producto_tallas")
      .select("producto_id")
      .in("producto_id", productIds);

    if (tallasError) {
      return apiError(tallasError, "No se pudo validar la talla del producto");
    }

    const productosConTalla = new Set((tallasData || []).map((item) => item.producto_id));

    const itemSinTalla = carrito.find(
      (item) => productosConTalla.has(item.id) && !item.talla?.trim()
    );

    if (itemSinTalla) {
      return apiError(
        `Debes seleccionar una talla para ${itemSinTalla.nombre}`,
        "Falta seleccionar una talla",
        400
      );
    }

    const total = carrito.reduce(
      (acc, item) => acc + Number(item.precio) * Number(item.cantidad),
      0
    );

    const placeholderOrder = `TMP-${crypto.randomUUID()}`;

    const pedidoPayload = {
      nombre,
      telefono,
      direccion,
      horario,
      total,
      estado: "pendiente",
      numero_orden: placeholderOrder,
    };

    let pedidoResponse = await supabase
      .from("pedidos")
      .insert([pedidoPayload])
      .select("id, created_at")
      .single();

    if (pedidoResponse.error?.message?.toLowerCase().includes("estado")) {
      const legacyPayload = {
        nombre,
        telefono,
        direccion,
        horario,
        total,
        numero_orden: placeholderOrder,
      };

      pedidoResponse = await supabase
        .from("pedidos")
        .insert([legacyPayload])
        .select("id, created_at")
        .single();
    }

    const { data: pedido, error: pedidoError } = pedidoResponse;

    if (pedidoError || !pedido) {
      return apiError(pedidoError, "No se pudo guardar el pedido");
    }

    let numeroOrden = buildOrderNumber(pedido.id, pedido.created_at);

    const rpcResult = await supabase.rpc("assign_order_number", {
      p_pedido_id: pedido.id,
    });

    if (!rpcResult.error && rpcResult.data) {
      numeroOrden = rpcResult.data as string;
    } else {
      const { error: updateError } = await supabase
        .from("pedidos")
        .update({ numero_orden: numeroOrden })
        .eq("id", pedido.id);

      if (updateError) {
        return apiError(updateError, "No se pudo generar el número de orden");
      }
    }

    const detalles = carrito.map((item) => ({
      pedido_id: pedido.id,
      producto_id: item.id,
      nombre: item.nombre,
      precio: Number(item.precio),
      cantidad: Number(item.cantidad),
      subtotal: Number(item.precio) * Number(item.cantidad),
      talla: item.talla?.trim() || null,
    }));

    const { error: detalleError } = await supabase.from("detalle_pedido").insert(detalles);

    if (detalleError) {
      await supabase.from("pedidos").delete().eq("id", pedido.id);
      return apiError(detalleError, "No se pudo guardar el detalle del pedido");
    }

    const { data: pedidoFinal } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", pedido.id)
      .single();

    return apiSuccess({
      pedido: pedidoFinal,
      numero_orden: numeroOrden,
      total,
    });
  } catch (error) {
    return apiError(error, "Error interno al procesar el pedido");
  }
}
