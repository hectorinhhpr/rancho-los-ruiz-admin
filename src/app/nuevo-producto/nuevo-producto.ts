import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para el [(ngModel)]
import { ProductoService } from '../services/producto'; // El servicio de Aylem

@Component({
  selector: 'app-nuevo-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-producto.html'
})
export class NuevoProductoComponent {
  // Objeto enlazado al formulario
  nuevoProducto = {
    nombre: '',
    descripcion: '', // 👈 Nuevo
    numero_parte: '', // 👈 Nuevo
    categoria: 'Hogar',
    precio_venta: null,
    codigo_barras: ''
  };
  
  archivoImagen: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;
  guardando = false;

  constructor(private productoService: ProductoService) {}

  // Captura el archivo de la foto y genera una vista previa
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoImagen = file;
      
      const reader = new FileReader();
      reader.onload = e => this.imagenPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  async guardar() {
    if (!this.nuevoProducto.nombre || !this.nuevoProducto.precio_venta) {
      alert('⚠️ Llena el nombre y el precio del producto.');
      return;
    }

    this.guardando = true;
    try {
      let imagen_url = '';
      
      // 1. Si Sami subió una foto, usamos el bucket de Supabase
      if (this.archivoImagen) {
        const url_subida = await this.productoService.subirImagenProducto(this.archivoImagen);
        if (url_subida) {
          imagen_url = url_subida;
        }
      }

      // 2. Preparamos los datos finales con la URL de la imagen
      const productoFinal = {
        ...this.nuevoProducto,
        precio_venta: Number(this.nuevoProducto.precio_venta), // 👈 Forzamos a que sea número
        imagen_url: imagen_url
      };

      // 3. Ejecutamos la función de Aylem para guardar en BD
      const productoGuardado = await this.productoService.crearProducto(productoFinal);
      
      // Aylem configuró el servicio para devolver el producto si hay éxito, o null si hay error
      if (productoGuardado) { 
        alert('✅ ¡Producto guardado con éxito!');
        this.limpiarFormulario();
      } else {
        alert('❌ Error al guardar. Es posible que el código de barras ya exista o falten datos.');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error de conexión con Supabase.');
    }
    this.guardando = false;
  }

  limpiarFormulario() {
    this.nuevoProducto = { 
      nombre: '', 
      descripcion: '', // <-- Nuevo
      numero_parte: '', // <-- Nuevo
      categoria: 'Alimentos', 
      precio_venta: null, 
      codigo_barras: '' 
    };
    this.archivoImagen = null;
    this.imagenPreview = null;
  }
}