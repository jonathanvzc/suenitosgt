// API privada para renovar o cerrar la sesión administrativa con cookie de inactividad.
import { cookies } from "next/headers";
import { apiError, apiSuccess } from "@/lib/api";
import { requireAdmin } from "@/lib/adminServer";
import { ADMIN_IDLE_COOKIE, ADMIN_IDLE_LIMIT_MS } from "@/lib/adminSession";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: Math.floor(ADMIN_IDLE_LIMIT_MS / 1000),
};

export async function POST(req: Request) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const lastActivity = Number(body?.lastActivity || Date.now());
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_IDLE_COOKIE, String(lastActivity), cookieOptions);

    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error, "No se pudo actualizar la sesión administrativa");
  }
}

export async function DELETE() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    await auth.supabase.auth.signOut();
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_IDLE_COOKIE);
    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error, "No se pudo cerrar la sesión administrativa");
  }
}
