// Cliente server-only con service role para operaciones backend que deben ignorar RLS de invitados.
import "server-only";
import { createClient } from "@supabase/supabase-js";

const requireEnv = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value;
};

// Devuelve un cliente administrativo solo para rutas API seguras del servidor.
export const createSupabaseAdmin = () =>
  createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

