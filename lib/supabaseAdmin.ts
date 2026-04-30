// Cliente server-only con service role para operaciones backend que deben ignorar RLS de invitados.
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Obtiene la primera variable disponible de una lista y falla con un mensaje claro si ninguna existe.
const requireAnyEnv = (names: string[]) => {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  throw new Error(
    `Falta la variable de entorno ${names.join(" o ")}. Verifica la configuración en Vercel y vuelve a desplegar.`
  );
};

// Devuelve un cliente administrativo solo para rutas API seguras del servidor.
export const createSupabaseAdmin = () =>
  createClient(
    requireAnyEnv(["NEXT_PUBLIC_SUPABASE_URL"]),
    requireAnyEnv([
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_SERVICE_ROLE",
      "SUPABASE_SERVICE_KEY",
    ]),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
