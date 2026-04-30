// Botón reutilizable para cerrar la sesión administrativa desde el panel.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/authClient";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => void handleLogout()}
      disabled={loading}
      className="mt-6 rounded-full border border-white/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
