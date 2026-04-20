"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // 🔐 REDIRIGIR SI YA LOGEADO
  // =========================
useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) return;

    router.replace("/admin");
  };

  checkSession();
}, [router]);

  // =========================
  // 🔑 LOGIN
  // =========================
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Ingresa correo y contraseña");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast.error("Credenciales incorrectas");
      return;
    }

    const user = data.user;

    // 🔥 VALIDAR ROL ADMIN (CRÍTICO)
    const { data: profile, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle(); // 🔥 evita crash

    if (roleError || profile?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("No tienes permisos de administrador");
      return;
    }

    toast.success("Bienvenido Admin 👑");

    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Iniciar sesión
        </h2>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-600 rounded-lg p-2 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-600 rounded-lg p-2 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* BOTÓN */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}