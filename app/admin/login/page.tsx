"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {supabase} from "@/lib/supabase";
import { isAdminUser } from "@/lib/admin";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true);
    setError("");

    console.log("LOGIN ATTEMPT:", email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("SUPABASE RESPONSE:", data, error);

      if (error || !data.session) {
        setError(error?.message || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      const user = data.user;

      console.log("USER ID:", user.id);

      const adminOk = await isAdminUser(user.id);

      console.log("IS ADMIN:", adminOk);

      if (!adminOk) {
        await supabase.auth.signOut();
        setError("No tienes permisos de administrador");
        setLoading(false);
        return;
      }

      // 🔥 IMPORTANTE: esperar un tick antes de navegar
      setTimeout(() => {
        window.location.href = "/admin";
      }, 100);

    } catch (err) {
      console.error(err);
      setError("Error inesperado");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-96">
        <h1 className="text-xl font-bold mb-4 text-center">
          Admin Login
        </h1>

        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          {loading ? "Validando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}