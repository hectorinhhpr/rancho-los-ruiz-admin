import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 

// Importamos los servicios de Supabase
import { ProductoService } from '../../services/producto'; 
import { VentaService } from '../../services/venta';

export interface Producto { 
  id: string; 
  nombre: string; 
  categoria: string; 
  precio: number; 
  icono: string; 
  codigo_barras: string; 
}
export interface ItemTicket { producto: Producto; cantidad: number; importe: number; }

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos.html',
})
export class PosComponent implements OnInit {
  
  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    private cdr: ChangeDetectorRef 
  ) {}

  productos: Producto[] = [];
  ticket: ItemTicket[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;
  ticketsPausados: ItemTicket[][] = [];

  // --- VARIABLES PARA EL MENÚ DE CATEGORÍAS ---
  productosOriginales: Producto[] = []; // Respaldo del catálogo completo
  categoriasSami = ['Todas', 'Hogar', 'Artesanía', 'Decoración', 'Alimentos', 'Vinatería', 'Ropa', 'Temporada'];
  categoriaSeleccionada = 'Todas';
  menuCategoriasAbierto = false;

  ngOnInit() {
    this.cargarCatalogo();
  }

  // Descargamos la mercancía real y creamos los botones dinámicamente
  async cargarCatalogo() {
    try {
      const catalogoBD: any = await this.productoService.getProductos();
      
      if (catalogoBD) {
        this.productos = catalogoBD.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: 'Restaurante', // Pronto Aylem cambiará esto desde Supabase
          precio: Number(p.precio_venta), 
          icono: '🍔',
          codigo_barras: p.codigo_barras 
        }));
        
        // ¡Guardamos la copia de seguridad para que el filtro funcione!
        this.productosOriginales = [...this.productos];
        
        this.cdr.detectChanges(); 
      }
    } catch (error) {
      console.error('Error al descargar productos:', error);
    }
  }

  // --- FUNCIONES DEL MENÚ DE CATEGORÍAS ---
  toggleMenuCategorias() {
    this.menuCategoriasAbierto = !this.menuCategoriasAbierto;
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.menuCategoriasAbierto = false; 
    
    if (categoria === 'Todas') {
      this.productos = [...this.productosOriginales];
    } else {
      this.productos = this.productosOriginales.filter(p => p.categoria === categoria);
    }
    
    this.cdr.detectChanges(); 
  }

  // --- LÓGICA DE LA CAJA ---
  agregarAlTicket(producto: Producto) {
    const itemExistente = this.ticket.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      itemExistente.cantidad++; 
      itemExistente.importe = itemExistente.cantidad * itemExistente.producto.precio;
    } else {
      this.ticket.push({ producto, cantidad: 1, importe: producto.precio }); 
    }
    
    this.ticket = [...this.ticket]; 
    this.calcularTotales();
  }

  calcularTotales() {
    this.subtotal = this.ticket.reduce((suma, item) => suma + item.importe, 0);
    this.iva = this.subtotal * 0.16; 
    this.total = this.subtotal + this.iva;
  }

  limpiarTicket() {
    this.ticket = [];
    this.calcularTotales();
  }

  pausarTicket() {
    if (this.ticket.length > 0) {
      this.ticketsPausados.push([...this.ticket]); 
      this.limpiarTicket();
    }
  }

  recuperarTicket(index: number) {
    if (this.ticket.length > 0) {
      alert('⚠️ Por favor cobra o cancela la orden actual antes de recuperar una pausada.');
      return;
    }
    this.ticket = this.ticketsPausados[index];
    this.ticketsPausados.splice(index, 1);
    this.calcularTotales();
  }

  async buscarProducto(termino: string) {
    if (!termino || termino.trim() === '') return;

    const terminoMinusculas = termino.toLowerCase();

    // Ahora buscamos en el catálogo original para que encuentre productos aunque estés en otra categoría
    const productoEncontrado = this.productosOriginales.find(p =>
      (p.codigo_barras && p.codigo_barras === termino) || 
      p.nombre.toLowerCase().includes(terminoMinusculas)  
    );

    if (productoEncontrado) {
      this.agregarAlTicket(productoEncontrado);
      this.cdr.detectChanges();
    } else {
      alert('⚠️ Producto no encontrado. Revisa el código o la palabra clave.');
    }
  }

  async cobrarTicket() {
    if (this.ticket.length === 0) {
      alert('Agrega productos antes de cobrar.');
      return;
    }

    const nuevaVenta = {
      total: this.total,
      metodo_pago: 'Efectivo', 
      detalles: this.ticket.map(item => ({
        id_producto: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio
      }))
    };

    try {
      const resultado = await this.ventaService.crearVenta(nuevaVenta as any);

      if (resultado.success) {
        window.print();
        this.limpiarTicket(); 
        this.cdr.detectChanges();
      } else {
        alert('❌ Hubo un error al guardar la venta: ' + resultado.error);
      }
    } catch (error) {
      console.error("Error al cobrar:", error);
      alert('❌ Hubo un error de conexión con la base de datos.');
    }
  }
}