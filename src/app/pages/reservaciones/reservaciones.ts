import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto'; 
import { ApartadoService } from '../../services/apartado'; 

@Component({
  selector: 'app-reservaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservaciones.html'
})
export class Reservaciones implements OnInit {
  // 👈 NUEVO: Ahora son 3 pestañas
  seccionActiva: 'nuevo' | 'lista' | 'historial' = 'nuevo';

  cliente = { nombre: '', telefono: '', fecha_limite: '', anticipo: 0 };
  carrito: any[] = [];
  total = 0;
  saldoPendiente = 0;
  terminoBusqueda = '';
  productosOriginales: any[] = [];
  resultadosBusqueda: any[] = [];

  listaApartados: any[] = []; 
  // 👈 NUEVA VARIABLE: Para guardar los liquidados
  historialLiquidados: any[] = []; 

  constructor(
    private productoService: ProductoService,
    private apartadoService: ApartadoService, 
    private cdr: ChangeDetectorRef // 👈 Esto es lo que "refresca" la pantalla sin usar F5
  ) {}

  async ngOnInit() {
    await this.cargarCatalogo();
    await this.cargarApartados(); 
  }

  // 👈 MODIFICADO: Refresca los datos según la pestaña a la que entres
  async cambiarSeccion(seccion: 'nuevo' | 'lista' | 'historial') {
    this.seccionActiva = seccion;
    if (seccion === 'lista') {
      await this.cargarApartados();
    } else if (seccion === 'historial') {
      await this.cargarHistorial();
    }
  }

  async cargarCatalogo() {
    const catalogo = await this.productoService.getProductos();
    if (catalogo) {
      this.productosOriginales = catalogo;
    }
  }

  async cargarApartados() {
    this.listaApartados = await this.apartadoService.getApartadosPendientes();
    this.cdr.detectChanges(); // Forzamos la actualización visual
  }

  async cargarHistorial() {
    this.historialLiquidados = await this.apartadoService.getApartadosEntregados();
    this.cdr.detectChanges(); // Forzamos la actualización visual
  }

  buscarProducto() {
    if (!this.terminoBusqueda.trim()) {
      this.resultadosBusqueda = [];
      return;
    }
    const term = this.terminoBusqueda.toLowerCase();
    this.resultadosBusqueda = this.productosOriginales.filter(p =>
      p.nombre.toLowerCase().includes(term) || 
      (p.codigo_barras && p.codigo_barras.includes(term))
    );
  }

  agregarAlCarrito(producto: any) {
    const existe = this.carrito.find(item => item.id === producto.id);
    if (existe) {
      existe.cantidad++;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
    this.terminoBusqueda = '';
    this.resultadosBusqueda = [];
    this.calcularTotales();
  }

  quitarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    this.total = this.carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);
    this.actualizarSaldo();
  }

  actualizarSaldo() {
    this.saldoPendiente = Math.max(0, this.total - this.cliente.anticipo);
  }

  async guardarApartado() {
    if (!this.cliente.nombre) {
      alert('⚠️ Por favor ingresa el nombre del cliente.'); return;
    }
    if (this.carrito.length === 0) {
      alert('⚠️ Agrega al menos un producto al apartado.'); return;
    }
    if (this.cliente.anticipo < 0 || this.cliente.anticipo > this.total) {
      alert('⚠️ El anticipo ingresado no es válido.'); return;
    }

    const nuevoApartado = {
      nombre_cliente: this.cliente.nombre,
      telefono: this.cliente.telefono,
      fecha_limite: this.cliente.fecha_limite || null,
      productos: this.carrito, 
      total: this.total,
      anticipo: this.cliente.anticipo,
      saldo_pendiente: this.saldoPendiente,
      estado: 'Pendiente'
    };

    const exito = await this.apartadoService.crearApartado(nuevoApartado);
    
    if (exito) {
      alert('✅ ¡Apartado registrado correctamente en la nube!');
      this.cliente = { nombre: '', telefono: '', fecha_limite: '', anticipo: 0 };
      this.carrito = [];
      this.calcularTotales();
      
      await this.cargarApartados();
      this.cambiarSeccion('lista');
    } else {
      alert('❌ Hubo un error al guardar el apartado.');
    }
  }

  // 👈 CORREGIDO: Fuerza la recarga sin pulsar F5
  async liquidarApartado(id: string, nombre: string) {
    if (confirm(`¿Confirmas que ${nombre} ya liquidó su saldo y le entregaste la mercancía?`)) {
      const exito = await this.apartadoService.liquidarApartado(id);
      if (exito) {
        await this.cargarApartados(); // Descarga la BD limpia
        this.cdr.detectChanges();     // Obliga a pintar el HTML
      } else {
        alert('❌ Error al actualizar el estado en la base de datos.');
      }
    }
  }

  // 👈 CORREGIDO: Fuerza la recarga sin pulsar F5
  async registrarAbono(apartado: any) {
    const abonoStr = prompt(`Saldo pendiente actual: $${apartado.saldo_pendiente}\n¿Cuánto abonará el cliente en este momento?`);
    
    if (!abonoStr) return; 

    const abonoNum = parseFloat(abonoStr);

    if (isNaN(abonoNum) || abonoNum <= 0) {
      alert('⚠️ Por favor ingresa una cantidad de abono válida.');
      return;
    }

    if (abonoNum > apartado.saldo_pendiente) {
      alert(`⚠️ El abono ($${abonoNum}) no puede ser mayor al saldo pendiente ($${apartado.saldo_pendiente}).`);
      return;
    }

    const nuevoSaldo = apartado.saldo_pendiente - abonoNum;

    if (nuevoSaldo === 0) {
      this.liquidarApartado(apartado.id, apartado.nombre_cliente);
      return;
    }

    if (confirm(`El cliente abonará $${abonoNum}. El nuevo saldo pendiente será de $${nuevoSaldo}. ¿Continuar?`)) {
      const exito = await this.apartadoService.registrarAbono(apartado.id, nuevoSaldo);
      if (exito) {
        alert('✅ ¡Abono registrado correctamente!');
        await this.cargarApartados(); // Descarga la BD con el saldo bajado
        this.cdr.detectChanges();     // Obliga a pintar el HTML
      } else {
        alert('❌ Hubo un error al registrar el abono.');
      }
    }
  }
}