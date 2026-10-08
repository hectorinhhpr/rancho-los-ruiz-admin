import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // Agregamos Router
import { SupabaseService } from '../../services/supabase'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  colapsado = false; // Variable original para saber si está escondido

  // Inyectamos el enrutador y la base de datos
  constructor(
    private router: Router, 
    private supabaseService: SupabaseService
  ) {}

  // Tu función original intacta
  toggleMenu() {
    this.colapsado = !this.colapsado;
  }

  // ¡NUEVO! Función para cerrar sesión
  async cerrarSesion() {
    await this.supabaseService.client.auth.signOut();
    this.router.navigate(['/login']);
  }
}