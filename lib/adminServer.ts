// Helper server-side para autorizar únicamente a usuarios con rol admin.
import { apiError } from "@/lib/api";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      response: apiError("Unauthorized", "No autorizado", 401),
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || profile?.role !== "admin") {
    return {
      ok: false as const,
      response: apiError("Forbidden", "Acceso restringido a administradores", 403),
    };
  }

  return {
    ok: true as const,
    supabase,
    user,
  };
}
