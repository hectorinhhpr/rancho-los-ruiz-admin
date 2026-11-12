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
  // Pestañas
  seccionActiva: 'registro' | 'catalogo' = 'registro'; 

  // Registro de nuevo producto
  nuevoProducto = {
    nombre: '', descripcion: '', numero_parte: '',
    categoria: '', precio_venta: null, codigo_barras: ''
  };
  archivoImagen: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;
  guardando = false;

  // Catálogo y Sugerencias
  listaProductos: any[] = []; 
  categoriasDisponibles: string[] = ['Hogar', 'Alimentos', 'Bebidas', 'Navidad', 'Artesanías'];

  // 👈 NUEVO: Variables para la Edición
  productoEnEdicion: any = null;
  archivoEdicion: File | null = null;
  imagenEdicionPreview: string | ArrayBuffer | null = null;
  guardandoEdicion = false;

  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef 
  ) {}

  async ngOnInit() {
    await this.cargarCatalogo();
  }

  cambiarSeccion(seccion: 'registro' | 'catalogo') {
    this.seccionActiva = seccion;
  }

  async cargarCatalogo() {
    const productos = await this.productoService.getProductos();
    if (productos) {
      this.listaProductos = productos; 
      const catsBD = productos.map((p: any) => p.categoria).filter((c: string) => c);
      this.categoriasDisponibles = Array.from(new Set([...this.categoriasDisponibles, ...catsBD]));
      this.cdr.detectChanges(); 
    }
  }

  // --- LÓGICA DE REGISTRO ---
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
      alert('⚠️ Llena el nombre y el precio del producto.'); return;
    }
    this.guardando = true;
    try {
      let imagen_url = '';
      if (this.archivoImagen) {
        const url_subida = await this.productoService.subirImagenProducto(this.archivoImagen);
        if (url_subida) imagen_url = url_subida;
      }

      const productoFinal = {
        nombre: this.nuevoProducto.nombre, descripcion: this.nuevoProducto.descripcion,
        numero_parte: this.nuevoProducto.numero_parte, categoria: this.nuevoProducto.categoria || 'General',
        precio_venta: Number(this.nuevoProducto.precio_venta), codigo_barras: this.nuevoProducto.codigo_barras,
        imagen_url: imagen_url
      };

      const exito = await this.productoService.crearProducto(productoFinal);
      if (exito) { 
        alert('✅ ¡Producto guardado con éxito!');
        this.limpiarFormulario();
        await this.cargarCatalogo(); 
        this.cambiarSeccion('catalogo'); 
      } else {
        alert('❌ Error al guardar. Verifica el código de barras.');
      }
    } catch (error) { alert('❌ Error de conexión.'); }
    this.guardando = false;
  }

  limpiarFormulario() {
    this.nuevoProducto = { nombre: '', descripcion: '', numero_parte: '', categoria: '', precio_venta: null, codigo_barras: '' };
    this.archivoImagen = null;
    this.imagenPreview = null;
  }

  // --- LÓGICA DEL CATÁLOGO ---
  async eliminarProducto(id: string, nombre: string) {
    if (confirm(`¿Estás seguro de eliminar permanentemente "${nombre}"?`)) {
      await this.productoService.eliminarProducto(id);
      await this.cargarCatalogo(); 
    }
  }

  // 👈 NUEVO: LÓGICA DE EDICIÓN ---
  abrirEdicion(producto: any) {
    this.productoEnEdicion = { ...producto }; // Clonamos para no afectar la tabla si cancela
    this.archivoEdicion = null;
    this.imagenEdicionPreview = producto.imagen_url;
  }

  cerrarEdicion() {
    this.productoEnEdicion = null;
    this.archivoEdicion = null;
    this.imagenEdicionPreview = null;
  }

  onEditFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoEdicion = file;
      const reader = new FileReader();
      reader.onload = e => this.imagenEdicionPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  async guardarEdicion() {
    this.guardandoEdicion = true;
    try {
      let nueva_imagen_url = this.productoEnEdicion.imagen_url;

      if (this.archivoEdicion) {
        const url_subida = await this.productoService.subirImagenProducto(this.archivoEdicion);
        if (url_subida) nueva_imagen_url = url_subida;
      }

      const datosActualizados = {
        nombre: this.productoEnEdicion.nombre,
        descripcion: this.productoEnEdicion.descripcion,
        numero_parte: this.productoEnEdicion.numero_parte,
        categoria: this.productoEnEdicion.categoria,
        precio_venta: Number(this.productoEnEdicion.precio_venta),
        codigo_barras: this.productoEnEdicion.codigo_barras,
        imagen_url: nueva_imagen_url
      };

      const exito = await this.productoService.actualizarProducto(this.productoEnEdicion.id, datosActualizados);
      
      if (exito) {
        alert('✅ Producto actualizado correctamente.');
        this.cerrarEdicion();
        await this.cargarCatalogo(); // Refrescamos la tabla
      } else {
        alert('❌ Error al actualizar el producto.');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error de conexión.');
    }
    this.guardandoEdicion = false;
  }
}