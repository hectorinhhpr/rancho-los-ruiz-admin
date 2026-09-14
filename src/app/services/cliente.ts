import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private supabaseService = inject(SupabaseService);

  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await this.supabaseService.client
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createCliente(cliente: Cliente): Promise<Cliente[]> {
    const { data, error } = await this.supabaseService.client
      .from('clientes')
      .insert([cliente])
      .select();

    if (error) throw error;
    return data || [];
  }

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente[]> {
    const { data, error } = await this.supabaseService.client
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data || [];
  }

  async deleteCliente(id: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}