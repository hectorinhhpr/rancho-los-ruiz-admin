import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  productosDisponibles: any[] = []; 

  nuevoInsumo = {
    producto_id: '',
    almacen: 'Principal',
    stock_actual: 0,
    stock_minimo: 0
  };

  constructor(
    private inventarioService: InventarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.inventarioService.getInventario().subscribe(datos => {
      this.listaInsumos = datos;
      this.cdr.detectChanges();
    });

    this.inventarioService.getProductosMenu().subscribe(productos => {
      this.productosDisponibles = productos;
      this.cdr.detectChanges();
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevoInsumo = { producto_id: '', almacen: 'Principal', stock_actual: 0, stock_minimo: 0 };
  }

  guardarInsumo() {
    if (!this.nuevoInsumo.producto_id) {
      alert('Por favor, selecciona un producto del menú.');
      return;
    }

    this.inventarioService.agregarInsumo(this.nuevoInsumo).subscribe({
      next: () => {
        this.cerrarModal(); 
        this.cargarDatos(); 
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        alert('Hubo un error al guardar en la base de datos.');
      }
    });
  }

  editarInsumo(item: ItemInventario) {
    console.log('Editar insumo:', item);
    alert(`Editar inventario de: ${item.productos?.nombre || 'Producto'}`);
  }

  eliminarInsumo(id: string) {
    if (confirm('¿Estás seguro de eliminar este registro del inventario?')) {
      this.inventarioService.eliminarInsumo(id).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err: any) => {
          console.error('Error al eliminar:', err);
          alert('No se pudo eliminar el registro.');
        }
      });
    }
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