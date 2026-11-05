import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Venta } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private supabaseService: SupabaseService) {}

  // Consultar el folio oficial desde la función que hizo Aylem en Supabase
  async obtenerSiguienteFolio(): Promise<string> {
    try {
      const { data, error } = await this.supabaseService.client
        .rpc('obtener_siguiente_folio'); 

      if (error) throw error;

      const numero = data || 1;
      return numero.toString().padStart(5, '0');
    } catch (err: any) {
      console.error('Error al obtener el siguiente folio:', err.message);
      return '00001'; 
    }
  }

  // Registrar venta y DESCONTAR STOCK
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

      // 2. Insertar el detalle de productos
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

      // 3. 👈 NUEVO: Descontar el stock de la base de datos
      for (const item of venta.detalles) {
        // Obtenemos cuánto stock hay actualmente
        const { data: prodData } = await this.supabaseService.client
          .from('productos')
          .select('stock')
          .eq('id', item.id_producto)
          .single();

        if (prodData && prodData.stock !== null) {
          const nuevoStock = prodData.stock - item.cantidad;
          
          // Actualizamos el producto con su nuevo stock
          await this.supabaseService.client
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id', item.id_producto);
        }
      }

      return { success: true, folio: ventaData.folio };
    } catch (err: any) {
      console.error('Error al registrar la venta y stock:', err.message);
      return { success: false, error: err.message };
    }
  }
}