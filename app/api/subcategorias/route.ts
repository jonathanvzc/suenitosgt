// API CRUD de subcategorias con filtro por categoria para el panel y el catalogo publico.
import { apiError, apiSuccess } from "@/lib/api";
import { requireAdmin } from "@/lib/adminServer";
import { createSupabaseServer } from "@/lib/supabaseServer";

const sanitize = (value: string) => value.replace(/<[^>]*>?/gm, "").trim();

const getNextSubcategoriaId = async (
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>
) => {
  const { data, error } = await supabase
    .from("subcategorias")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Number(data?.id || 0) + 1;
};

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("subcategorias")
      .select("*")
      .order("categoria_id", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      return apiError(error, "No se pudieron cargar las subcategorías");
    }

    return apiSuccess({ data: data || [] });
  } catch (error) {
    return apiError(error, "Error al cargar subcategorías");
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const supabase = auth.supabase;
    const body = await req.json();
    const nombre = sanitize(body?.nombre || "");
    const categoria_id = Number(body?.categoria_id);

    if (!nombre || !categoria_id) {
      return apiError("Datos inválidos", "Datos inválidos", 400);
    }

    const id = await getNextSubcategoriaId(supabase);

    const { data, error } = await supabase
      .from("subcategorias")
      .insert([{ id, nombre, categoria_id }])
      .select()
      .single();

    if (error) {
      return apiError(error, "No se pudo crear la subcategoría");
    }

    return apiSuccess({ data }, { status: 201 });
  } catch (error) {
    return apiError(error, "Error al crear la subcategoría");
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const supabase = auth.supabase;
    const body = await req.json();
    const id = Number(body?.id);
    const nombre = sanitize(body?.nombre || "");
    const categoria_id = Number(body?.categoria_id);

    if (!id || !nombre || !categoria_id) {
      return apiError("Datos inválidos", "Datos inválidos", 400);
    }

    const { data, error } = await supabase
      .from("subcategorias")
      .update({ nombre, categoria_id })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return apiError(error, "No se pudo actualizar la subcategoría");
    }

    return apiSuccess({ data });
  } catch (error) {
    return apiError(error, "Error al actualizar la subcategoría");
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth.ok) {
      return auth.response;
    }

    const supabase = auth.supabase;
    const body = await req.json();
    const id = Number(body?.id);

    if (!id) {
      return apiError("ID inválido", "ID inválido", 400);
    }

    const { error } = await supabase.from("subcategorias").delete().eq("id", id);

    if (error) {
      return apiError(error, "No se pudo eliminar la subcategoría");
    }

    return apiSuccess({});
  } catch (error) {
    return apiError(error, "Error al eliminar la subcategoría");
  }
}
