import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface PerfilUsuario {
  id: string;
  nombre: string;
  rol: 'administrador' | 'cajero';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private supabaseService: SupabaseService) {}

  // Iniciar sesión con Email y Contraseña
  async login(email: string, pass: string): Promise<{ success: boolean; perfil?: PerfilUsuario; error?: string }> {
    try {
      const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) throw error;

      // Obtener datos del perfil y rol del usuario
      const perfil = await this.obtenerPerfil(data.user.id);
      return { success: true, perfil };
    } catch (err: any) {
      console.error('Error en login:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Obtener la información del perfil según el ID del usuario
  async obtenerPerfil(userId: string): Promise<PerfilUsuario | undefined> {
    const { data } = await this.supabaseService.client
      .from('perfiles')
      .select('id, nombre, rol')
      .eq('id', userId)
      .single();

    return data as PerfilUsuario;
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
  }

  // Obtener el usuario autenticado actualmente
  async obtenerUsuarioActual() {
    const { data: { user } } = await this.supabaseService.client.auth.getUser();
    if (!user) return null;
    return await this.obtenerPerfil(user.id);
  }
}