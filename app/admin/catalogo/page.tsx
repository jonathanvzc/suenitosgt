// Pantalla puente del modulo catalogo que dirige al CRUD de categorias o subcategorias.
import Link from "next/link";

const cards = [
  {
    href: "/admin/categorias",
    title: "CRUD de categorías",
    description: "Crea, actualiza y elimina las categorías principales del catálogo.",
  },
  {
    href: "/admin/subcategorias",
    title: "CRUD de subcategorías",
    description: "Administra subcategorías por categoría desde una pantalla dedicada.",
  },
];

export default function CatalogoPage() {
  return (
    <div className="space-y-8 p-2">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">Catálogo</h1>
        <p className="mt-2 text-sm text-gray-500">
          Elige el módulo que quieres administrar.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-2xl font-black text-gray-900">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-gray-500">{card.description}</p>
            <span className="mt-5 inline-flex rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white">
              Abrir
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
