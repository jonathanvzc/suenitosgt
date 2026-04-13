import { useEffect, useState } from "react";
import {
  getProductos,
  getCategorias,
  getSubcategorias,
} from "../services/productoService";

export const useProductos = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);

  const loadData = async () => {
    const [prod, cat, sub] = await Promise.all([
      getProductos(),
      getCategorias(),
      getSubcategorias(),
    ]);

    setProductos(prod.data || []);
    setCategorias(cat.data || []);
    setSubcategorias(sub.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    productos,
    categorias,
    subcategorias,
    reload: loadData,
  };
};