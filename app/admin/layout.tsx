// Layout protegido del backoffice con validacion de rol admin y navegacion interna.
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminSessionManager from "@/components/admin/AdminSessionManager";
import { ADMIN_LOGIN_PATH } from "@/lib/adminSession";
import { createSupabaseServer } from "@/lib/supabaseServer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") || "";

  if (pathname === ADMIN_LOGIN_PATH) {
    return children;
  }

  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSessionManager />
      <div className="flex min-h-screen flex-col gap-4 px-4 py-4 lg:flex-row">
        <aside className="w-full rounded-[28px] bg-green-700 p-5 text-white shadow-xl lg:min-h-[calc(100vh-2rem)] lg:w-72">

          <h2 className="mt-3 text-2xl font-black">Sueñitos GT</h2>

          <nav className="mt-8 flex flex-col gap-2">
            <Link href="/admin" className="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-white/10">
              Dashboard
            </Link>
            <Link
              href="/admin/productos"
              className="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Productos
            </Link>
            <Link
              href="/admin/categorias"
              className="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Categorías
            </Link>
            <Link
              href="/admin/subcategorias"
              className="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Subcategorías
            </Link>
            <Link
              href="/admin/pedidos"
              className="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Pedidos
            </Link>
            <Link
              href="/"
              className="mt-4 rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-green-700 transition hover:bg-green-50"
            >
              Ver tienda
            </Link>
          </nav>

          <AdminLogoutButton />
        </aside>

        <main className="flex-1 rounded-[32px] bg-white p-5 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
