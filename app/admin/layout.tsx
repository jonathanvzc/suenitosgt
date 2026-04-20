import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();

  // =========================
  // 🔐 USER AUTH
  // =========================
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // =========================
  // 🔐 ROLE CHECK
  // =========================
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // ⚠️ seguridad: si falla perfil, bloquear
  if (error || !profile) {
    redirect("/");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  // =========================
  // 🧠 ADMIN LAYOUT UI
  // =========================
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-green-700 text-white p-5 flex flex-col min-h-screen">

        <div>
          <h2 className="text-xl font-bold mb-6">
            Admin Panel
          </h2>

          <nav className="flex flex-col gap-3">

            <Link href="/admin" className="hover:bg-green-800 p-2 rounded">
              Dashboard
            </Link>

            <Link href="/admin/productos" className="hover:bg-green-800 p-2 rounded">
              Productos
            </Link>

            <Link href="/admin/pedidos" className="hover:bg-green-800 p-2 rounded">
              Pedidos
            </Link>

            <Link
              href="/"
              className="bg-white text-green-700 p-2 rounded text-center font-semibold hover:bg-gray-100 transition"
            >
              Ver tienda
            </Link>
          </nav>
        </div>
        

      </aside>


      {/* CONTENIDO */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}