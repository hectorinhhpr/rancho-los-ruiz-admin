import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);

  async login(email: string, pass: string): Promise<AuthResponse> {
    return await this.supabaseService.client.auth.signInWithPassword({
      email,
      password: pass
    });
  }

  async logout(): Promise<{ error: Error | null }> {
    return await this.supabaseService.client.auth.signOut();
  }

  async getUser() {
    const { data } = await this.supabaseService.client.auth.getUser();
    return data.user;
  }
}