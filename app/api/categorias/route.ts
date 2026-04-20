import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden", { ascending: true }); // 👈 CLAVE

  if (error) {
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data);
}