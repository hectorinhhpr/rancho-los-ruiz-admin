import { Component } from '@angular/core';
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
export class PosComponent {
  
  // ¡Inyectamos la base de datos de Karime al iniciar la pantalla!
  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService
  ) {}

  // 2. Inventario de prueba (Lo conservamos por ahora para que los botones visuales no desaparezcan)
  productos: Producto[] = [
    { id: '1', nombre: 'Hamburguesa Sencilla', categoria: 'Restaurante', precio: 120.00, icono: '🍔' },
    { id: '2', nombre: 'Refresco de Cola 600ml', categoria: 'Tienda', precio: 35.00, icono: '🥤' },
    { id: '3', nombre: 'Silla Tiffany (Renta 1D)', categoria: 'Mobiliario', precio: 25.00, icono: '🪑' },
    { id: '4', nombre: 'Papas a la Francesa', categoria: 'Restaurante', precio: 45.00, icono: '🍟' }
  ];

  // 3. Variables de la Caja Registradora
  ticket: ItemTicket[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;

  // 4. Función para cuando haces clic en un producto
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

  // 5. Matemáticas automáticas
  calcularTotales() {
    this.subtotal = this.ticket.reduce((suma, item) => suma + item.importe, 0);
    this.iva = this.subtotal * 0.16; // Calculamos el 16% de IVA
    this.total = this.subtotal + this.iva;
  }

  // 6. Botón de cancelar
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

    // 1. Intentamos buscar el código en Supabase a través del servicio de Karime
    const productoBD = await this.productoService.getProductoByCodigo(codigo);
    
    if (productoBD) {
      this.agregarAlTicket(productoBD as any);
    } else {
      // 2. Plan B: Si no está en Supabase, buscamos en tus botones locales
      const productoMock = this.productos.find(p => p.id === codigo);
      if (productoMock) {
        this.agregarAlTicket(productoMock);
      } else {
        alert('⚠️ Producto no encontrado en la base de datos de Supabase.');
      }
    }
  }

  // ¡NUEVO! Función para registrar la venta en la nube
  async cobrarTicket() {
    if (this.ticket.length === 0) {
      alert('Agrega productos antes de cobrar.');
      return;
    }

    // Armamos los datos exactos como Karime los programó
    const nuevaVenta = {
      total: this.total,
      metodo_pago: 'Efectivo', // Por ahora lo dejamos por defecto
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
        alert(`✅ ¡Venta registrada con éxito en Supabase!`);
        this.limpiarTicket(); // Borramos la pantalla para el siguiente cliente
      } else {
        alert('❌ Hubo un error al guardar la venta: ' + resultado.error);
      }
    } catch (error) {
      console.error("Error al cobrar:", error);
      alert('❌ Hubo un error de conexión con la base de datos.');
    }
  }
}