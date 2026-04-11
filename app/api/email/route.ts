import nodemailer from "nodemailer";

type CarritoItem = {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nombre,
      telefono,
      direccion,
      horario,
      carrito,
      total,
      orderId,
    }: {
      nombre: string;
      telefono: string;
      direccion: string;
      horario: string;
      carrito: CarritoItem[];
      total: number;
      orderId: string;
    } = body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const rows = carrito
      .map(
        (p) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">${p.id}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;">${p.nombre}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${p.cantidad}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">Q${
            p.precio * p.cantidad
          }</td>
        </tr>
      `
      )
      .join("");

    const html = `
    <div style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
      
      <div style="max-width:700px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
        
        <!-- HEADER -->
        <div style="background:#16a34a;color:#fff;padding:20px;text-align:center;">
          <h2 style="margin:0;">🛍️ Nuevo Pedido #${orderId}</h2>
        </div>

        <!-- INFO CLIENTE -->
        <div style="padding:20px;">
          <h3 style="margin-bottom:10px;">📦 Información del Cliente</h3>

          <p><b>Cliente:</b> ${nombre}</p>
          <p><b>Teléfono:</b> ${telefono}</p>
          <p><b>Dirección:</b> ${direccion}</p>
          <p><b>Horario:</b> ${horario}</p>
        </div>

        <!-- TABLA -->
        <div style="padding:20px;">
          <h3>🧾 Detalle del Pedido</h3>

          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead>
              <tr style="background:#f0f0f0;text-align:left;">
                <th style="padding:10px;">ID</th>
                <th style="padding:10px;">Producto</th>
                <th style="padding:10px;">Cant.</th>
                <th style="padding:10px;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>

        <!-- TOTAL -->
        <div style="padding:20px;text-align:right;border-top:1px solid #eee;">
          <h2 style="color:#16a34a;margin:0;">
            💰 Total: Q${total}
          </h2>
        </div>

        <!-- FOOTER -->
        <div style="background:#f9f9f9;padding:15px;text-align:center;font-size:12px;color:#777;">
          Sistema automático de pedidos - Sueñitos GT
        </div>

      </div>
    </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // admin
      subject: `🛒 Pedido #${orderId}`,
      html, // 🔥 IMPORTANTE: HTML en lugar de text
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("EMAIL ERROR:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}