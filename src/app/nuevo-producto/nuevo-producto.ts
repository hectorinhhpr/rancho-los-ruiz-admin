import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  listaProductos: any[] = []; // 👈 Guardará el catálogo completo
  categoriasDisponibles: string[] = ['Hogar', 'Alimentos', 'Bebidas', 'Navidad', 'Artesanías'];

  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef // 👈 Para forzar la actualización de la tabla
  ) {}

  async ngOnInit() {
    await this.cargarCatalogo();
  }

  // 👈 FUNCIÓN ACTUALIZADA: Trae los productos y extrae las categorías
  async cargarCatalogo() {
    const productos = await this.productoService.getProductos();
    if (productos) {
      this.listaProductos = productos; // Llenamos la tabla
      
      const catsBD = productos.map((p: any) => p.categoria).filter((c: string) => c);
      this.categoriasDisponibles = Array.from(new Set([...this.categoriasDisponibles, ...catsBD]));
      
      this.cdr.detectChanges(); // Actualizamos la pantalla
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
        await this.cargarCatalogo(); // 👈 Actualiza la tabla automáticamente
      } else {
        alert('❌ Error al guardar. Es posible que el código de barras ya exista.');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error de conexión con Supabase.');
    }
    this.guardando = false;
  }

  // 👈 NUEVA FUNCIÓN: Eliminar del Catálogo
  async eliminarProducto(id: string, nombre: string) {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente "${nombre}" de tu menú?`)) {
      await this.productoService.eliminarProducto(id);
      // Ahora, como Supabase borra todo en cascada, solo le decimos a Angular que recargue la tabla
      await this.cargarCatalogo(); 
    }
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