import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. ¡NUEVO! Permite leer formularios
import { ClienteService } from '../../services/cliente'; // 2. ¡Descomentado!

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
  imports: [CommonModule, FormsModule], // 3. ¡Agregamos FormsModule aquí!
  templateUrl: './clientes.html'
})
export class ClientesComponent implements OnInit {

  listaClientes: Cliente[] = [];
  mostrarModal = false; 

  // 4. Variables para atrapar lo que escribes en el modal
  nuevoNombre = '';
  nuevoTelefono = '';
  nuevoTipo = 'Nuevo';

  constructor(
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  async cargarClientes() {
    try {
      const data: any = await this.clienteService.getClientes();
      
      if (data) {
        // 5. Mapeamos el 'nombre_completo' que Aylem creó en Supabase
        this.listaClientes = data.map((c: any) => ({
          id: c.id,
          nombre: c.nombre_completo || c.nombre, // Compatible con la base de datos
          telefono: c.telefono,
          correo: c.correo,
          tipo: c.tipo,
          ultimaVisita: c.ultima_visita || 'Reciente' 
        }));
        
        this.cdr.detectChanges(); 
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    // Limpiamos los campos al cancelar
    this.nuevoNombre = '';
    this.nuevoTelefono = '';
    this.nuevoTipo = 'Nuevo';
  }

  // 6. ¡La función real para guardar en la nube!
  async guardarCliente() {
    if (!this.nuevoNombre) {
      alert('⚠️ Por favor, ingresa al menos el nombre del cliente.');
      return;
    }

    const nuevoRegistro = {
      nombre_completo: this.nuevoNombre,
      telefono: this.nuevoTelefono,
      tipo: this.nuevoTipo,
      correo: 'No registrado' 
    };

    try {
      // 👇 AQUÍ ESTÁ EL CAMBIO: Usamos createCliente, como lo llamó Karime 👇
      const resultado = await this.clienteService.createCliente(nuevoRegistro as any);

      if (resultado) {
        this.cerrarModal(); 
        this.cargarClientes(); // Recargamos la tabla para ver al nuevo cliente
      } else {
        alert('❌ Error al guardar en la base de datos.');
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert('❌ Hubo un problema al conectar con Supabase.');
    }
  }
}