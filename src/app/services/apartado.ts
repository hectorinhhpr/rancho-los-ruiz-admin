import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class ApartadoService {
  constructor(private supabaseService: SupabaseService) {}

  // Guarda el nuevo apartado en la nube
  async crearApartado(apartado: any): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.client
        .from('apartados')
        .insert([apartado]);
        
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error al guardar apartado:', err.message);
      return false;
    }
  }

  // Descarga solo los apartados que no han sido entregados
  async getApartadosPendientes(): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('apartados')
        .select('*')
        .eq('estado', 'Pendiente')
        .order('fecha_apartado', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error al descargar apartados:', err.message);
      return [];
    }
  }

  // Cambia el estado cuando el cliente termina de pagar
  async liquidarApartado(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.client
        .from('apartados')
        .update({ estado: 'Entregado', saldo_pendiente: 0 })
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error al liquidar:', err.message);
      return false;
    }
  }
  // Registra un abono parcial y actualiza el saldo pendiente
  async registrarAbono(id: string, nuevoSaldoPendiente: number): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.client
        .from('apartados')
        .update({ saldo_pendiente: nuevoSaldoPendiente })
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error al registrar abono:', err.message);
      return false;
    }
  }
  // Descarga el historial de apartados que ya fueron entregados/liquidados
  async getApartadosEntregados(): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('apartados')
        .select('*')
        .eq('estado', 'Entregado')
        .order('fecha_apartado', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error al descargar historial:', err.message);
      return [];
    }
  }
}