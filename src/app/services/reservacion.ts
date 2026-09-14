import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';
import { Reservacion } from '../models/reservacion.model';

@Injectable({
  providedIn: 'root'
})
export class ReservacionService {
  private supabaseService = inject(SupabaseService);

  async getReservaciones(): Promise<Reservacion[]> {
    const { data, error } = await this.supabaseService.client
      .from('reservaciones')
      .select('*, cliente:clientes(*)')
      .order('fecha_inicio', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createReservacion(reservacion: Reservacion): Promise<Reservacion[]> {
    const { data, error } = await this.supabaseService.client
      .from('reservaciones')
      .insert([reservacion])
      .select();

    if (error) throw error;
    return data || [];
  }

  async updateReservacion(id: string, reservacion: Partial<Reservacion>): Promise<Reservacion[]> {
    const { data, error } = await this.supabaseService.client
      .from('reservaciones')
      .update(reservacion)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data || [];
  }

  async deleteReservacion(id: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('reservaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
