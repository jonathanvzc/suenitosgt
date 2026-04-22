// Endpoint auxiliar del admin para exponer informacion protegida del panel cuando aplique.
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Profile error", detail: error.message },
      { status: 500 }
    );
  }

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    role: profile.role,
  });
}
