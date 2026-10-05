import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private supabaseService: SupabaseService) {}

  // Método que consultará el lector de código de barras desde el POS
  async getProductoByCodigo(codigo: string): Promise<Producto | null> {
    const { data, error } = await this.supabaseService.client
      .from('productos')
      .select('*')
      .eq('codigo_barras', codigo)
      .single();

    if (error) {
      console.error('Error al buscar el producto por código:', error.message);
      return null;
    }

    return data;
  }
}