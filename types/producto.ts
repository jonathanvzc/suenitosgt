export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string | null;
  categoria_id: number;
  subcategoria_id: number;
};

export type Categoria = {
  id: number;
  nombre: string;
};

export type Subcategoria = {
  id: number;
  nombre: string;
  categoria_id: number;
};

export type FormProducto = {
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: File | null;
  imagen_url: string | null;
  categoria_id: number;
  subcategoria_id: number;

  //  NUEVO
imagenes?: {
  id: number;
  imagen_url: string;
  file?: File;
}[];

  video_url?: string;
};