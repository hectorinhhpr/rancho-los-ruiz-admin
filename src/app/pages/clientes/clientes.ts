import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// ⚠️ Descomentar cuando Karime termine el servicio en Supabase
// import { ClienteService } from '../../services/cliente'; 

// Adaptamos la interfaz exactamente a los nombres de variables de tu HTML
export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  tipo: string;
  ultimaVisita: string; 
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes.html'
})
export class ClientesComponent implements OnInit {

  // 1. Variables exactas que estás usando en tu HTML
  listaClientes: Cliente[] = [];
  mostrarModal = false; 

  constructor(
    // private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  // 2. Conexión a la base de datos (Lista para activarse)
  async cargarClientes() {
    /*
    try {
      const data: any = await this.clienteService.getClientes();
      
      if (data) {
        // Mapeamos los datos de Aylem a tus variables del HTML
        this.listaClientes = data.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          telefono: c.telefono,
          correo: c.correo,
          tipo: c.tipo,
          ultimaVisita: c.ultima_visita || 'Reciente' // Traducimos el guion bajo
        }));
        
        this.cdr.detectChanges(); // Despertamos a Angular para dibujar la tabla
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
    */
  }

  // 3. Funciones para abrir y cerrar el recuadro flotante
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // 4. Próxima función a programar (Guardar el formulario)
  guardarCliente() {
    alert('Falta conectar este botón con Supabase para guardar el cliente.');
    this.cerrarModal();
  }
}