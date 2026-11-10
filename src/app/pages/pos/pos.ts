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
  icono?: string; 
  codigo_barras: string; 
  imagen_url?: string;
  stock: number;         
  descripcion?: string;  
  numero_parte?: string; 
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
  
  // 👈 MODIFICADO: Ahora almacena los objetos complejos que vienen de la nube
  ticketsPausados: any[] = [];

  // --- VARIABLES PARA EL TICKET ESTÉTICO ---
  numeroTicket: string = 'Cargando...'; 
  nombreCajero: string = 'Cargando...'; 
  fechaTicket: Date = new Date();

  // --- VARIABLES PARA EL MENÚ Y MODAL ---
  productosOriginales: Producto[] = []; 
  categorias: string[] = ['Todas']; 
  categoriaSeleccionada = 'Todas';
  menuCategoriasAbierto = false;
  productoSeleccionado: Producto | null = null; 

  async ngOnInit() {
    await this.cargarFolioInicial(); 
    this.cargarCatalogo();
    this.obtenerUsuarioActual();
    await this.cargarTicketsPausados(); // 👈 NUEVO: Descarga tickets pendientes al abrir la caja
  }

  async cargarFolioInicial() {
    this.numeroTicket = await this.ventaService.obtenerSiguienteFolio();
    this.cdr.detectChanges();
  }

  // 👈 NUEVO: Función para mantener sincronizados los tickets pausados
  async cargarTicketsPausados() {
    this.ticketsPausados = await this.ventaService.obtenerTicketsPausados();
    this.cdr.detectChanges();
  }

  obtenerUsuarioActual() {
    const correoGuardado = localStorage.getItem('sb-tuproyecto-auth-token') || 'Sami';
    
    if (correoGuardado !== 'Sami') {
      try {
        const authData = JSON.parse(correoGuardado);
        this.nombreCajero = authData.user.email.split('@')[0];
      } catch (e) {
        this.nombreCajero = 'Sami';
      }
    } else {
      this.nombreCajero = 'Sami';
    }
    
    this.cdr.detectChanges();
  }

  async cargarCatalogo() {
    try {
      const catalogoBD: any = await this.productoService.getProductos();
      
      if (catalogoBD) {
        this.productos = catalogoBD.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria || 'Sin categoría', 
          precio: Number(p.precio_venta), 
          imagen_url: p.imagen_url,
          codigo_barras: p.codigo_barras,
          stock: p.stock !== undefined && p.stock !== null ? Number(p.stock) : 0, 
          descripcion: p.descripcion,            
          numero_parte: p.numero_parte           
        }));
        
        this.productosOriginales = [...this.productos];
        
        const categoriasUnicas = new Set(this.productos.map(p => p.categoria));
        this.categorias = ['Todas', ...Array.from(categoriasUnicas)];
        
        this.cdr.detectChanges(); 
      }
    } catch (error) {
      console.error('Error al descargar productos:', error);
    }
  }

  abrirDetalles(producto: Producto, event: Event) {
    event.stopPropagation(); 
    this.productoSeleccionado = producto;
  }

  cerrarDetalles() {
    this.productoSeleccionado = null;
  }

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
    if (producto.stock <= 0) {
      alert(`❌ El producto "${producto.nombre}" se encuentra AGOTADO.`);
      return;
    }

    const itemExistente = this.ticket.find(item => item.producto.id === producto.id);
    const cantidadActualEnTicket = itemExistente ? itemExistente.cantidad : 0;

    if (cantidadActualEnTicket + 1 > producto.stock) {
      alert(`⚠️ Stock insuficiente. Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}".`);
      return;
    }
    
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

  // 👈 MODIFICADO: Ahora envía el ticket a la nube
  async pausarTicket() {
    if (this.ticket.length > 0) {
      const guardado = await this.ventaService.pausarTicketNube(this.nombreCajero, this.ticket);
      if (guardado) {
        this.limpiarTicket();
        await this.cargarTicketsPausados(); // Refrescamos la lista visible
      } else {
        alert('❌ Error al conectar con Supabase. El ticket no se pudo pausar.');
      }
    }
  }

  // 👈 MODIFICADO: Descarga el ticket de la nube y lo elimina para no duplicar
  async recuperarTicket(index: number) {
    if (this.ticket.length > 0) {
      alert('⚠️ Por favor cobra o cancela la orden actual antes de recuperar una pausada.');
      return;
    }
    
    const ticketRecuperado = this.ticketsPausados[index];
    
    // Pasamos los productos JSON a la memoria de la caja
    this.ticket = ticketRecuperado.productos; 
    
    // Eliminamos el ticket de la nube para que otro cajero no lo descargue por error
    await this.ventaService.eliminarTicketPausado(ticketRecuperado.id);
    
    // Refrescamos los datos
    await this.cargarTicketsPausados();
    this.calcularTotales();
  }

  async buscarProducto(termino: string) {
    if (!termino || termino.trim() === '') return;
    const terminoMinusculas = termino.toLowerCase();

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
        this.fechaTicket = new Date();
        this.cdr.detectChanges();

        window.print();
        this.limpiarTicket(); 
        
        await this.cargarFolioInicial();
        await this.cargarCatalogo();
        
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