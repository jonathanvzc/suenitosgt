import { supabase } from "@/lib/supabase";

export const getProductos = async () => {
  return await supabase
    .from("productos")
    .select(`
      id,
      nombre,
      descripcion,
      precio,
      imagen_url,
      categoria_id,
      subcategoria_id,
      categorias (nombre),
      subcategorias (nombre)
    `)
    .is("deleted_at", null)
    .order("id", { ascending: false });
};

export const getCategorias = async () => {
  return await supabase.from("categorias").select("*");
};

export const getSubcategorias = async () => {
  return await supabase.from("subcategorias").select("*");
};

export const insertProducto = async (data: any) => {
  return await supabase.from("productos").insert([data]);
};

export const updateProducto = async (id: number, data: any) => {
  return await supabase.from("productos").update(data).eq("id", id);
};

export const deleteProducto = async (id: number) => {
  return await supabase
    .from("productos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
};