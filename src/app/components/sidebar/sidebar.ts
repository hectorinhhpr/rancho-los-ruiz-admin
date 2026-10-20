import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Agregamos ChangeDetectorRef
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; 
import { AuthService } from '../../services/auth.service'; // Asegura que la ruta sea correcta a tu auth.ts
import { SupabaseService } from '../../services/supabase'; 

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit {
  colapsado = false; 
  rolActual = 'cajero'; 

  constructor(
    private router: Router, 
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef // 2. Inyectamos el detector de cambios
  ) {}

  ngOnInit() {
    this.cargarRol();

    // 3. MAGIA: Escuchamos en vivo si alguien entra o sale de la cuenta
    this.supabaseService.client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        this.cargarRol();
      }
    });
  }

  cargarRol() {
    this.authService.getUserRole().subscribe(rol => {
      this.rolActual = rol;
      this.cdr.detectChanges(); // 4. Forzamos a Angular a actualizar los botones INMEDIATAMENTE
    });
  }

  toggleMenu() {
    this.colapsado = !this.colapsado;
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}