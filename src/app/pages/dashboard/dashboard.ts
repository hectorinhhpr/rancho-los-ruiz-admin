import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  // Lista de "Aplicaciones" estilo Odoo
  modulos = [
    { nombre: 'Punto de Venta', icono: '🛒', ruta: '/pos', colorTexto: 'text-green-600', colorFondo: 'bg-green-100' },
    { nombre: 'Clientes', icono: '👥', ruta: '/clientes', colorTexto: 'text-blue-600', colorFondo: 'bg-blue-100' },
    { nombre: 'Reservaciones', icono: '📅', ruta: '/dashboard', colorTexto: 'text-purple-600', colorFondo: 'bg-purple-100' },
    { nombre: 'Inventario', icono: '📦', ruta: '/dashboard', colorTexto: 'text-orange-600', colorFondo: 'bg-orange-100' },
    { nombre: 'Reportes', icono: '📊', ruta: '/dashboard', colorTexto: 'text-red-600', colorFondo: 'bg-red-100' },
    { nombre: 'Configuración', icono: '⚙️', ruta: '/dashboard', colorTexto: 'text-stone-600', colorFondo: 'bg-stone-200' }
  ];
}