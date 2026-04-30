// Funciones cliente para terminar la sesión administrativa de forma consistente.
import { supabase } from "@/lib/supabase";

export const logout = async () => {
  try {
    await fetch("/api/admin/session", {
      method: "DELETE",
      cache: "no-store",
    });
  } catch {
    // Ignore and continue with client sign out.
  }

  await supabase.auth.signOut();
  window.location.href = "/admin/login";
};
