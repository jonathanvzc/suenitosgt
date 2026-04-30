// API CRUD de categorias consumida por el home, navbar y panel administrativo.
import { apiError, apiSuccess } from "@/lib/api";
import { requireAdmin } from "@/lib/adminServer";
import { createSupabaseServer } from "@/lib/supabaseServer";

const sanitize = (value: string) => value.replace(/<[^>]*>?/gm, "").trim();

const getNextCategoriaId = async (supabase: Awaited<ReturnType<typeof createSupabaseServer>>) => {
  const { data, error } = await supabase
    .from("categorias")
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
      .from("categorias")
      .select("*")
      .order("orden", { ascending: true });

    if (error) {
      return apiError(error, "No se pudieron cargar las categorías");
    }

    return apiSuccess({ data: data || [] });
  } catch (error) {
    return apiError(error, "Error al cargar categorías");
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
    const orden = Number(body?.orden || 0);

    if (!nombre) {
      return apiError("El nombre es obligatorio", "El nombre es obligatorio", 400);
    }

    const id = await getNextCategoriaId(supabase);

    const { data, error } = await supabase
      .from("categorias")
      .insert([{ id, nombre, orden }])
      .select()
      .single();

    if (error) {
      return apiError(error, "No se pudo crear la categoría");
    }

    return apiSuccess({ data }, { status: 201 });
  } catch (error) {
    return apiError(error, "Error al crear la categoría");
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
    const orden = Number(body?.orden || 0);

    if (!id || !nombre) {
      return apiError("Datos inválidos", "Datos inválidos", 400);
    }

    const { data, error } = await supabase
      .from("categorias")
      .update({ nombre, orden })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return apiError(error, "No se pudo actualizar la categoría");
    }

    return apiSuccess({ data });
  } catch (error) {
    return apiError(error, "Error al actualizar la categoría");
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

    const { error } = await supabase.from("categorias").delete().eq("id", id);

    if (error) {
      return apiError(error, "No se pudo eliminar la categoría");
    }

    return apiSuccess({});
  } catch (error) {
    return apiError(error, "Error al eliminar la categoría");
  }
}
