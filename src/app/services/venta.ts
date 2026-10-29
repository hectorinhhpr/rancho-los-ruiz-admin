import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Venta } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private supabaseService: SupabaseService) {}

  // NUEVO: Consultar el folio oficial desde la función que hizo Aylem en Supabase
  async obtenerSiguienteFolio(): Promise<string> {
    try {
      const { data, error } = await this.supabaseService.client
        .rpc('obtener_siguiente_folio'); // Llama a la función de la BD

      if (error) throw error;

      // Si la base regresa un número, lo rellenamos con ceros (ej: 00002)
      const numero = data || 1;
      return numero.toString().padStart(5, '0');
    } catch (err: any) {
      console.error('Error al obtener el siguiente folio:', err.message);
      return '00001'; // Fallback por seguridad
    }
  }

  // Registrar una nueva venta completa (ticket + detalle de productos)
  async crearVenta(venta: Venta): Promise<{ success: boolean; folio?: string; error?: string }> {
    try {
      // 1. Insertar la venta principal
      const { data: ventaData, error: ventaError } = await this.supabaseService.client
        .from('ventas')
        .insert({
          total: venta.total,
          metodo_pago: venta.metodo_pago
        })
        .select()
        .single();

      if (ventaError) throw ventaError;

      // 2. Mapear e insertar el detalle de productos vinculados al ID de la venta creada
      const detallesConVenta = venta.detalles.map((item) => ({
        id_venta: ventaData.id,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));

      const { error: detalleError } = await this.supabaseService.client
        .from('detalle_ventas')
        .insert(detallesConVenta);

      if (detalleError) throw detalleError;

      return { success: true, folio: ventaData.folio };
    } catch (err: any) {
      console.error('Error al registrar la venta:', err.message);
      return { success: false, error: err.message };
    }
  }
}