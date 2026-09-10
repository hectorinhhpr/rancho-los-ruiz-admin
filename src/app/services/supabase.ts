import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://yneyxibcdpdgxpxhhxsz.supabase.co',
      'sb_publishable_ejjnp2QZm3aDRhl9jyjpbQ_JIY5Ymjh'
    );
  }

  get client() {
    return this.supabase;
  }
}