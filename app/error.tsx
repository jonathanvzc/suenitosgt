// Pantalla de error global de App Router para capturar fallos de renderizado en la tienda.
"use client";

import { useEffect } from "react";
import { toastError } from "@/lib/toast";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toastError(error.message || "Ocurrió un error inesperado");
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
        Error
      </p>
      <h2 className="mt-3 text-3xl font-black text-gray-900">Algo salió mal</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
        Hubo un problema cargando esta vista. Puedes intentar nuevamente sin perder
        el resto de la tienda.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        Reintentar
      </button>
    </div>
  );
}
