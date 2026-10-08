import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductoService } from '../../services/producto'; 
import { VentaService } from '../../services/venta';

export interface Producto { id: string; nombre: string; categoria: string; precio: number; icono: string; }
export interface ItemTicket { producto: Producto; cantidad: number; importe: number; }

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos.html',
})
export class PosComponent implements OnInit {
  codigoBusqueda: string = ''; // <--- Agrega esta línea si no existe
  // ... demás propiedades

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService
  ) {}

  // 1. Iniciamos con la lista vacía para llenarla desde Supabase
  productos: Producto[] = [];

  // 2. Variables de la Caja Registradora
  ticket: ItemTicket[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;

  // 3. Se ejecuta automáticamente al cargar la pantalla
  async ngOnInit() {
    await this.cargarProductos();
  }

  // Carga de productos desde el servicio
  async cargarProductos() {
    try {
      const data: any = await this.productoService.getProductos();
      console.log('Datos recibidos de Supabase:', data); // <--- Añade esta línea para depurar

      if (data && data.length > 0) {
        this.productos = data.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
          categoria: item.categoria || 'Restaurante',
          precio: Number(item.precio_venta || item.precio || 0),
          icono: item.icono || '📦'
        }));
      }
    } catch (error) {
      console.error('Error al cargar productos de Supabase:', error);
    }
  }
  // 4. Función para cuando haces clic en un producto
  agregarAlTicket(producto: Producto) {
    const precioNumerico = Number(producto.precio) || 0;
    const itemExistente = this.ticket.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      itemExistente.cantidad++;
      itemExistente.importe = itemExistente.cantidad * (Number(itemExistente.producto.precio) || precioNumerico);
    } else {
      this.ticket.push({
        producto: { ...producto, precio: precioNumerico },
        cantidad: 1,
        importe: precioNumerico
      });
    }
    this.calcularTotales();
  }

  // 7. Matemáticas automáticas
  calcularTotales() {
    this.subtotal = this.ticket.reduce((suma, item) => {
      const precio = Number(item.producto?.precio) || Number(item.importe) || 0;
      const cantidad = Number(item.cantidad) || 1;
      return suma + (precio * cantidad);
    }, 0);
    this.iva = this.subtotal * 0.16;
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

  // --- CONEXIÓN CON SUPABASE ---
async buscarProducto(codigo: string) {
    if (!codigo || codigo.trim() === '') return;

    const productoBD: any = await this.productoService.getProductoByCodigo(codigo);

    if (productoBD) {
      const productoAdaptado = {
        id: productoBD.id,
        nombre: productoBD.nombre,
        categoria: 'Restaurante',
        precio: Number(productoBD.precio_venta || productoBD.precio),
        icono: '🍔'
      };

      this.agregarAlTicket(productoAdaptado as any);
    } else {
      const productoMock = this.productos.find(p => p.id === codigo);
      if (productoMock) {
        this.agregarAlTicket(productoMock);
      } else {
        alert('⚠️ Producto no encontrado en la base de datos.');
      }
    }

    this.codigoBusqueda = '';
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
        alert(`✅ ¡Venta registrada con éxito en Supabase!`);
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