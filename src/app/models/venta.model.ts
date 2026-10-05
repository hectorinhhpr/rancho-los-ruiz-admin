export interface DetalleVenta {
  id?: number;
  id_venta?: number;
  id_producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
}

export interface Venta {
  id?: number;
  folio?: string;
  fecha?: string;
  total: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  estado?: 'completada' | 'cancelada';
  detalles: DetalleVenta[];
}