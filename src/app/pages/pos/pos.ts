import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para el formato de moneda

// Importamos los nuevos servicios que hizo Karime (verifica que la ruta apunte a tu carpeta services)
import { ProductoService } from '../../services/producto'; 
import { VentaService } from '../../services/venta';

// 1. Definimos cómo es un Producto y cómo es un Artículo en el Ticket
export interface Producto { id: string; nombre: string; categoria: string; precio: number; icono: string; }
export interface ItemTicket { producto: Producto; cantidad: number; importe: number; }

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos.html',
})
export class PosComponent implements OnInit {
  
  // ¡Inyectamos la base de datos de Karime al iniciar la pantalla!
  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService
  ) {}

  // 2. ¡Vaciamos la lista! Ya no hay productos falsos, inicia en blanco
  productos: Producto[] = [];

  // 3. Variables de la Caja Registradora
  ticket: ItemTicket[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;

  // 4. Se ejecuta automáticamente al abrir la pantalla del POS
  ngOnInit() {
    this.cargarCatalogo();
  }

  // 5. Descargamos la mercancía real y creamos los botones dinámicamente
  async cargarCatalogo() {
    try {
      const catalogoBD: any = await this.productoService.getProductos();
      
      if (catalogoBD) {
        // Mapeamos las columnas de Karime a las variables de tu interfaz para pintar los botones
        this.productos = catalogoBD.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: 'Restaurante', // Columna no existente en BD, usamos default
          precio: Number(p.precio_venta), // Traducimos el precio
          icono: '🍔' // Icono default
        }));
      }
    } catch (error) {
      console.error('Error al descargar productos de Supabase:', error);
    }
  }

  // 6. Función para cuando haces clic en un producto
  agregarAlTicket(producto: Producto) {
    const itemExistente = this.ticket.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      itemExistente.cantidad++; // Si ya está en el ticket, sumamos 1 a la cantidad
      itemExistente.importe = itemExistente.cantidad * itemExistente.producto.precio;
    } else {
      this.ticket.push({ producto, cantidad: 1, importe: producto.precio }); // Si es nuevo, lo agregamos
    }
    this.calcularTotales();
  }

  // 7. Matemáticas automáticas
  calcularTotales() {
    this.subtotal = this.ticket.reduce((suma, item) => suma + item.importe, 0);
    this.iva = this.subtotal * 0.16; // Calculamos el 16% de IVA
    this.total = this.subtotal + this.iva;
  }

  // 8. Botón de cancelar
  limpiarTicket() {
    this.ticket = [];
    this.calcularTotales();
  }

  // --- LÓGICA DE TICKETS PAUSADOS ---

  ticketsPausados: ItemTicket[][] = [];

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

  // --- CONEXIÓN CON SUPABASE (KARIME) ---

  // Lector de Códigos de Barras conectado a la BD real
  async buscarProducto(codigo: string) {
    if (!codigo || codigo.trim() === '') return;

    // 1. Buscamos el código en Supabase
    const productoBD: any = await this.productoService.getProductoByCodigo(codigo);
    
    if (productoBD) {
      // 2. Mapeamos los datos de Karime a las variables de tu interfaz
      const productoAdaptado = {
        id: productoBD.id,
        nombre: productoBD.nombre,
        categoria: 'Restaurante', // Ponemos uno por defecto porque Karime no tiene esta columna
        precio: Number(productoBD.precio_venta), // ¡LA CLAVE! Traducimos su columna a tu variable
        icono: '🍔' // Icono por defecto
      };
      
      this.agregarAlTicket(productoAdaptado as any);
    } else {
      // 3. Plan B: Buscar en los botones locales si falla la BD
      const productoMock = this.productos.find(p => p.id === codigo);
      if (productoMock) {
        this.agregarAlTicket(productoMock);
      } else {
        alert('⚠️ Producto no encontrado. Pídele a Karime que revise las políticas RLS (SELECT) en la tabla de productos.');
      }
    }
  }

  // ¡NUEVO! Función para registrar la venta en la nube e imprimir
  async cobrarTicket() {
    if (this.ticket.length === 0) {
      alert('Agrega productos antes de cobrar.');
      return;
    }

    // Armamos los datos exactos como Karime los programó
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
      // Enviamos la venta a Supabase
      const resultado = await this.ventaService.crearVenta(nuevaVenta as any);

      if (resultado.success) {
        // 1. Mandamos a imprimir automáticamente el ticket
        window.print();
        
        // 2. Limpiamos el carrito en silencio para el siguiente cliente
        this.limpiarTicket(); 
      } else {
        alert('❌ Hubo un error al guardar la venta: ' + resultado.error);
      }
    } catch (error) {
      console.error("Error al cobrar:", error);
      alert('❌ Hubo un error de conexión con la base de datos.');
    }
  }
}