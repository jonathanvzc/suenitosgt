"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, Package, ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold mb-8">Admin Panel</h1>

          <Link href="/admin" className="flex items-center gap-2 mb-3 bg-gray-800 p-2 rounded">
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <Link href="/admin/productos" className="flex items-center gap-2 mb-3 p-2 rounded hover:bg-gray-800">
            <Package size={18} /> Productos
          </Link>

          <Link href="/admin/pedidos" className="flex items-center gap-2 p-2 rounded hover:bg-gray-800">
            <ClipboardList size={18} /> Pedidos
          </Link>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-600 p-2 rounded hover:bg-red-700"
        >
          <LogOut size={18} /> Salir
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}