import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Venta } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private supabaseService: SupabaseService) {}

  // 1. FOLIOS MENSUALES (Conectado al RPC de Aylem)
  async obtenerSiguienteFolio(): Promise<string> {
    try {
      const { data, error } = await this.supabaseService.client
        .rpc('obtener_siguiente_folio_mes'); 

      if (error) throw error;
      return data || 'V-00000-00001';
    } catch (err: any) {
      console.error('Error al obtener el siguiente folio:', err.message);
      return 'ERROR-FOLIO'; 
    }
  }

  // 2. CREAR VENTA (Se mantiene tu lógica de descuento de inventario)
  async crearVenta(venta: Venta): Promise<{ success: boolean; folio?: string; error?: string }> {
    try {
      const { data: ventaData, error: ventaError } = await this.supabaseService.client
        .from('ventas')
        .insert({
          total: venta.total,
          metodo_pago: venta.metodo_pago
        })
        .select()
        .single();

      if (ventaError) throw ventaError;

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

      // Descontar el stock apuntando a la tabla 'inventario'
      for (const item of venta.detalles) {
        const { data: invData } = await this.supabaseService.client
          .from('inventario')
          .select('id, stock_actual')
          .eq('producto_id', item.id_producto)
          .single();

        if (invData && invData.stock_actual !== null) {
          const nuevoStock = invData.stock_actual - item.cantidad;
          await this.supabaseService.client
            .from('inventario')
            .update({ stock_actual: nuevoStock })
            .eq('id', invData.id);
        }
      }

      return { success: true, folio: ventaData.folio };
    } catch (err: any) {
      console.error('Error al registrar la venta y stock:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. NUEVO: LÓGICA DE TICKETS PAUSADOS EN LA NUBE
  async pausarTicketNube(cajero: string, ticket: any[]): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.client
        .from('tickets_pausados')
        .insert([{
          cajero: cajero,
          productos: ticket // Supabase lo convierte a JSONB automáticamente
        }]);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error al pausar ticket:', err.message);
      return false;
    }
  }

  async obtenerTicketsPausados(): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('tickets_pausados')
        .select('*')
        .order('fecha', { ascending: true }); // Ordenados por el más antiguo
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error al obtener tickets pausados:', err.message);
      return [];
    }
  }

  async eliminarTicketPausado(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.client
        .from('tickets_pausados')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error al eliminar ticket pausado:', err.message);
      return false;
    }
  }
}