// Pantalla dedicada al CRUD de subcategorias filtradas por categoria usando el gestor compartido.
import CatalogManagementClient from "../catalogo/CatalogManagementClient";

export default function AdminSubcategoriasPage() {
  return <CatalogManagementClient mode="subcategorias" />;
}
