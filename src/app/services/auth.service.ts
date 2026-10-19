import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Obtener el usuario actual logueado en la sesión
  getCurrentUser(): Observable<User | null> {
    return from(
      this.supabase.auth.getUser()
    ).pipe(
      map(response => response.data.user)
    );
  }

  // Obtener el rol del usuario desde la tabla 'perfiles' de Supabase
// Obtener el rol del usuario desde la tabla 'perfiles' de Supabase
  getUserRole(): Observable<string> {
    return this.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) return of('cajero'); // Por defecto si no hay sesión activa
        return from(
          this.supabase
            .from('perfiles')
            .select('rol')
            .eq('id', user.id)
            .single()
        ).pipe(
          map(res => {
            if (!res.data) return 'cajero';
            const rol = res.data.rol;
            // Estandarizar si en la base de datos dice 'administrador'
            return (rol === 'administrador' || rol === 'admin') ? 'admin' : 'cajero';
          })
        );
      })
    );
  }

  // Iniciar sesión
  async login(correo: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email: correo, password });
  }

  // Cerrar sesión
  async logout() {
    return await this.supabase.auth.signOut();
  }
}