export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio_venta: number;
  stock: number;
  codigo_barras: string;
  categoria?: string;
  created_at?: string;
}