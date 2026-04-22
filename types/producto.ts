export type ProductoImagen = {
  id: number;
  imagen_url: string;
  file?: File;
};

export type ProductoTalla = {
  id: number;
  talla: string;
  stock: number;
};

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string | null;
  categoria_id: number;
  subcategoria_id: number | null;
  observaciones?: string | null;
  video_url?: string | null;
  producto_imagenes?: ProductoImagen[];
  producto_tallas?: ProductoTalla[];
};

export type Categoria = {
  id: number;
  nombre: string;
  orden?: number | null;
};

export type Subcategoria = {
  id: number;
  nombre: string;
  categoria_id: number;
  orden?: number | null;
};

export type FormProducto = {
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: File | null;
  imagen_url: string | null;
  categoria_id: number;
  subcategoria_id: number | null;
  observaciones: string;
  imagenes: ProductoImagen[];
  tallas: ProductoTalla[];
  video_url: string;
};
