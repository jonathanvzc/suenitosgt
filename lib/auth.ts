// Utilidades cliente para consultar sesión y autenticación actual de Supabase.
import { supabase } from "@/lib/supabase";

//  Obtener usuario
export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

//  Obtener sesión (CLAVE para proteger rutas)
export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

//  Validar autenticación
export const requireAuth = async () => {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return null;
  }

  return data.session;
};
