// Pantalla dedicada al CRUD de categorias usando el gestor compartido del catalogo.
import CatalogManagementClient from "../catalogo/CatalogManagementClient";

export default function AdminCategoriasPage() {
  return <CatalogManagementClient mode="categorias" />;
}
