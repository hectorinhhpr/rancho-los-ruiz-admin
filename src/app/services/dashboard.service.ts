import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Obtener resumen de ventas por mes para las gráficas
  getVentasPorMes(): Observable<any[]> {
    return from(
      this.supabase.from('vista_ventas_por_mes').select('*')
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  // Obtener conteo de clientes nuevos por mes
  getClientesNuevosPorMes(): Observable<any[]> {
    return from(
      this.supabase.from('vista_clientes_nuevos_por_mes').select('*')
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }
}