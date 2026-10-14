import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ItemInventario {
  id?: string;
  producto_id: string;
  almacen: string;
  stock_actual: number;
  stock_minimo: number;
  fecha_caducidad?: string;
  fecha_actualizacion?: string;
  productos?: {
    nombre: string;
    codigo_barras?: string;
    precio?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Obtener todo el inventario con los datos del producto relacionado
  getInventario(): Observable<ItemInventario[]> {
    return from(
      this.supabase
        .from('inventario')
        .select('*, productos(nombre, codigo_barras, precio)')
        .order('stock_actual', { ascending: true })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as ItemInventario[];
      })
    );
  }

  // Actualizar el stock de un ítem
  actualizarStock(id: string, nuevoStock: number): Observable<any> {
    return from(
      this.supabase
        .from('inventario')
        .update({ 
          stock_actual: nuevoStock,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id)
    );
  }
}