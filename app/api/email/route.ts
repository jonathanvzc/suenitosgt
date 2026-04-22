// API server-only que envia el resumen del pedido por correo usando credenciales protegidas.
import nodemailer from "nodemailer";
import { apiError, apiSuccess } from "@/lib/api";
import { getMailConfig } from "@/lib/serverEnv";

type CarritoItem = {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  talla?: string | null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sanitize = (value: string) => value.replace(/<[^>]*>?/gm, "").trim();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nombre = sanitize(body?.nombre || "");
    const telefono = sanitize(body?.telefono || "");
    const direccion = sanitize(body?.direccion || "");
    const horario = sanitize(body?.horario || "");
    const numeroOrden = sanitize(body?.numero_orden || "");
    const total = Number(body?.total || 0);
    const carrito = Array.isArray(body?.carrito) ? (body.carrito as CarritoItem[]) : [];

    if (!nombre || !telefono || !direccion || !horario || !numeroOrden || carrito.length === 0) {
      return apiError("Datos incompletos", "Datos incompletos para enviar el correo", 400);
    }

    const { smtpPass, smtpTo, smtpUser } = getMailConfig();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const rows = carrito
      .map(
        (item) => `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${item.id}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.nombre)}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.talla || "-")}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.cantidad}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">Q${
              item.precio * item.cantidad
            }</td>
          </tr>
        `
      )
      .join("");

    const text = [
      `Nuevo pedido ${numeroOrden}`,
      `Cliente: ${nombre}`,
      `Teléfono: ${telefono}`,
      `Dirección: ${direccion}`,
      `Horario: ${horario}`,
      "",
      ...carrito.map((item) => {
        const talla = item.talla ? ` | Talla: ${item.talla}` : "";
        return `${item.nombre}${talla} | Cant: ${item.cantidad} | Subtotal: Q${
          item.precio * item.cantidad
        }`;
      }),
      "",
      `Total: Q${total}`,
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
        <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#0f172a;color:#ffffff;padding:24px 28px;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.7;">Nuevo pedido</p>
            <h2 style="margin:0;font-size:28px;">${escapeHtml(numeroOrden)}</h2>
          </div>

          <div style="padding:24px 28px;">
            <h3 style="margin-top:0;color:#111827;">Datos del cliente</h3>
            <p><b>Cliente:</b> ${escapeHtml(nombre)}</p>
            <p><b>Teléfono:</b> ${escapeHtml(telefono)}</p>
            <p><b>Dirección:</b> ${escapeHtml(direccion)}</p>
            <p><b>Horario:</b> ${escapeHtml(horario)}</p>
          </div>

          <div style="padding:0 28px 28px;">
            <h3 style="color:#111827;">Detalle del pedido</h3>
            <table style="width:100%;border-collapse:collapse;margin-top:12px;">
              <thead>
                <tr style="background:#f8fafc;text-align:left;">
                  <th style="padding:10px;">ID</th>
                  <th style="padding:10px;">Producto</th>
                  <th style="padding:10px;">Talla</th>
                  <th style="padding:10px;text-align:center;">Cant.</th>
                  <th style="padding:10px;text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>

          <div style="padding:20px 28px;background:#f8fafc;border-top:1px solid #e5e7eb;text-align:right;">
            <p style="margin:0;font-size:13px;color:#64748b;">Total del pedido</p>
            <h2 style="margin:6px 0 0;color:#059669;">Q${total}</h2>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: smtpUser,
      to: smtpTo,
      replyTo: smtpUser,
      subject: `Nuevo pedido ${numeroOrden}`,
      text,
      html,
    });

    return apiSuccess({});
  } catch (error) {
    return apiError(error, "No se pudo enviar el email");
  }
}
