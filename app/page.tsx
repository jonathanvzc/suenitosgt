// Entrada principal del storefront que delega el listado de productos al cliente.
import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HomeClient />
    </Suspense>
  );
}
