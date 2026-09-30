import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para el formato de moneda (CurrencyPipe)

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
  // 2. Inventario de prueba (Aylem reemplazará esto con Supabase después)
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
  // Función para el Lector de Códigos de Barras
  buscarProducto(codigo: string) {
    // Buscamos si el código escaneado coincide con algún ID de nuestro inventario
    const productoEncontrado = this.productos.find(p => p.id === codigo);
    
    if (productoEncontrado) {
      this.agregarAlTicket(productoEncontrado);
    } else {
      alert('⚠️ Producto no encontrado en la base de datos');
    }
  }
}