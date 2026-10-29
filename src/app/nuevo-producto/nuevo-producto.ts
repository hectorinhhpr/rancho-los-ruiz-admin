import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProductoService } from '../services/producto'; 

@Component({
  selector: 'app-nuevo-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-producto.html'
})
export class NuevoProductoComponent implements OnInit {
  nuevoProducto = {
    nombre: '',
    descripcion: '',
    numero_parte: '',
    categoria: '',
    precio_venta: null,
    codigo_barras: ''
  };
  
  archivoImagen: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;
  guardando = false;

  // Lista de categorías sugeridas (se alimenta de lo que ya hay en la BD + predeterminadas)
  categoriasDisponibles: string[] = ['Hogar', 'Alimentos', 'Bebidas', 'Navidad', 'Artesanías'];

  constructor(private productoService: ProductoService) {}

  async ngOnInit() {
    await this.cargarCategoriasExistentes();
  }

  // Trae las categorías que ya se hayan registrado en Supabase para mostrarlas como sugerencia
  async cargarCategoriasExistentes() {
    const productos = await this.productoService.getProductos();
    if (productos) {
      const catsBD = productos.map((p: any) => p.categoria).filter((c: string) => c);
      // Unimos las de la BD con las base sin repetir elementos
      this.categoriasDisponibles = Array.from(new Set([...this.categoriasDisponibles, ...catsBD]));
    }
  }

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
      
      if (this.archivoImagen) {
        const url_subida = await this.productoService.subirImagenProducto(this.archivoImagen);
        if (url_subida) {
          imagen_url = url_subida;
        }
      }

      const productoFinal = {
        nombre: this.nuevoProducto.nombre,
        descripcion: this.nuevoProducto.descripcion,
        numero_parte: this.nuevoProducto.numero_parte,
        categoria: this.nuevoProducto.categoria || 'General',
        precio_venta: Number(this.nuevoProducto.precio_venta),
        codigo_barras: this.nuevoProducto.codigo_barras,
        imagen_url: imagen_url
      };

      const productoGuardado = await this.productoService.crearProducto(productoFinal);
      
      if (productoGuardado) { 
        alert('✅ ¡Producto guardado con éxito en Supabase!');
        this.limpiarFormulario();
        await this.cargarCategoriasExistentes(); // Actualiza la lista si se creó una nueva
      } else {
        alert('❌ Error al guardar. Es posible que el código de barras ya exista.');
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
      descripcion: '',
      numero_parte: '',
      categoria: '', 
      precio_venta: null, 
      codigo_barras: '' 
    };
    this.archivoImagen = null;
    this.imagenPreview = null;
  }
}