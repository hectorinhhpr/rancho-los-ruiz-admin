import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; 
import { SupabaseService } from '../../services/supabase'; 

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  colapsado = false; 
  
  // VARIABLE TEMPORAL DE PRUEBA (Cambia a 'Admin' o 'Cajero' para probar)
  rolActual = 'Admin'; 

  constructor(
    private router: Router, 
    private supabaseService: SupabaseService
  ) {}

  toggleMenu() {
    this.colapsado = !this.colapsado;
  }

  async cerrarSesion() {
    await this.supabaseService.client.auth.signOut();
    this.router.navigate(['/login']);
  }
}