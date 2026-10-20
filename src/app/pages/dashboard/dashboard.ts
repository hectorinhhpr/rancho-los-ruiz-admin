import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  // Lista de "Aplicaciones" estilo Odoo
  modulos = [
    { nombre: 'Punto de Venta', icono: '🛒', ruta: '/pos', colorTexto: 'text-green-600', colorFondo: 'bg-green-100' },
    { nombre: 'Clientes', icono: '👥', ruta: '/clientes', colorTexto: 'text-blue-600', colorFondo: 'bg-blue-100' },
    { nombre: 'Reservaciones', icono: '📅', ruta: '/dashboard', colorTexto: 'text-purple-600', colorFondo: 'bg-purple-100' },
    { nombre: 'Inventario', icono: '📦', ruta: '/inventario', colorTexto: 'text-orange-600', colorFondo: 'bg-orange-100' },
    { nombre: 'Reportes', icono: '📊', ruta: '/dashboard', colorTexto: 'text-red-600', colorFondo: 'bg-red-100' }
  ];

  // Variable para controlar si el menú está visible o no
  mostrarMenuPerfil = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Función que abre/cierra el menú al dar clic
  toggleMenuPerfil() {
    this.mostrarMenuPerfil = !this.mostrarMenuPerfil;
  }

  // Función para cerrar sesión desde el nuevo botón
  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}