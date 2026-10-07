import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  tipo: 'Frecuente' | 'Ocasional' | 'Nuevo';
  ultimaVisita: string;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes.html',
})
export class Clientes {
  // Variables para controlar la ventana modal
  mostrarModal = false;

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // Datos de prueba para maquetar la tabla
  listaClientes: Cliente[] = [
    { id: 'C001', nombre: 'Juan Pérez', telefono: '55 1234 5678', correo: 'juan@email.com', tipo: 'Frecuente', ultimaVisita: '2026-09-28' },
    { id: 'C002', nombre: 'María González', telefono: '55 9876 5432', correo: 'maria@email.com', tipo: 'Nuevo', ultimaVisita: '2026-10-02' },
    { id: 'C003', nombre: 'Carlos Ruiz', telefono: '55 5555 5555', correo: 'carlos.r@email.com', tipo: 'Ocasional', ultimaVisita: '2026-08-15' },
    { id: 'C004', nombre: 'Ana López', telefono: '55 1111 2222', correo: 'ana.lopez@email.com', tipo: 'Frecuente', ultimaVisita: '2026-10-04' }
  ];
}