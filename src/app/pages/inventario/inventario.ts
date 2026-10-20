import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, ItemInventario } from '../../services/inventario.service'; 

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html'
})
export class InventarioComponent implements OnInit {
  
  filtroEstado = 'Todos';
  terminoBusqueda = '';
  mostrarModal = false;

  listaInsumos: ItemInventario[] = []; 
  productosDisponibles: any[] = []; // 👈 MAGIA: Aquí guardaremos la Hamburguesa, Hot Dog, etc.

  nuevoInsumo = {
    producto_id: '',
    almacen: 'Principal',
    stock_actual: 0,
    stock_minimo: 0
  };

  constructor(private inventarioService: InventarioService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // 1. Cargamos la tabla del inventario
    this.inventarioService.getInventario().subscribe(datos => {
      this.listaInsumos = datos;
    });

    // 2. Cargamos los productos reales para tu menú desplegable
    this.inventarioService.getProductosMenu().subscribe(productos => {
      this.productosDisponibles = productos;
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevoInsumo = { producto_id: '', almacen: 'Principal', stock_actual: 0, stock_minimo: 0 };
  }

  // 👈 MAGIA: La función que realmente guarda en la base de datos
  guardarInsumo() {
    if (!this.nuevoInsumo.producto_id) {
      alert('Por favor, selecciona un producto del menú.');
      return;
    }

    this.inventarioService.agregarInsumo(this.nuevoInsumo).subscribe({
      next: () => {
        this.cerrarModal(); // Escondemos la ventana
        this.cargarDatos(); // Refrescamos la tabla para ver el producto recién agregado
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Hubo un error al guardar en la base de datos.');
      }
    });
  }

  obtenerColorAlerta(actual: number, minimo: number): string {
    if (actual <= minimo / 2) return 'bg-red-100 text-red-700';
    if (actual <= minimo) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  get insumosFiltrados() {
    return this.listaInsumos.filter(item => {
      const nombreProducto = item.productos?.nombre || '';
      const coincideBusqueda = nombreProducto.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      
      if (!coincideBusqueda) return false;
      if (this.filtroEstado === 'Todos') return true;

      const critico = item.stock_actual <= item.stock_minimo / 2;
      const bajo = item.stock_actual <= item.stock_minimo && !critico;
      const optimo = item.stock_actual > item.stock_minimo;

      if (this.filtroEstado === 'Críticos') return critico;
      if (this.filtroEstado === 'Por Agotarse') return bajo;
      if (this.filtroEstado === 'Óptimos') return optimo;
      
      return true;
    });
  }
}