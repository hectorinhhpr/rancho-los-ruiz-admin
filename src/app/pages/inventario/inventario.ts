import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. ¡NUEVO! Permite usar [(ngModel)]

export interface Insumo {
  id: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule], // 2. ¡NUEVO! Registramos FormsModule
  templateUrl: './inventario.html'
})
export class InventarioComponent {
  
  filtroEstado = 'Todos'; // 3. Variable que guarda lo que elijas en el menú

  listaInsumos: Insumo[] = [
    { id: '1', nombre: 'Carne de Hamburguesa', categoria: 'Alimentos', stockActual: 15, stockMinimo: 20, unidad: 'kg' },
    { id: '2', nombre: 'Pan Artesanal', categoria: 'Alimentos', stockActual: 50, stockMinimo: 30, unidad: 'piezas' },
    { id: '3', nombre: 'Refresco Cola 600ml', categoria: 'Bebidas', stockActual: 4, stockMinimo: 24, unidad: 'botellas' },
    { id: '4', nombre: 'Papas a la francesa', categoria: 'Alimentos', stockActual: 12, stockMinimo: 10, unidad: 'kg' },
    { id: '5', nombre: 'Mayonesa', categoria: 'Insumos', stockActual: 2, stockMinimo: 5, unidad: 'cubetas' }
  ];

  obtenerColorAlerta(actual: number, minimo: number): string {
    if (actual <= minimo / 2) return 'bg-red-100 text-red-700';
    if (actual <= minimo) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  // 4. ¡NUEVA MAGIA! Esta función filtra la lista en tiempo real
  get insumosFiltrados() {
    if (this.filtroEstado === 'Todos') {
      return this.listaInsumos;
    }

    return this.listaInsumos.filter(item => {
      const critico = item.stockActual <= item.stockMinimo / 2;
      const bajo = item.stockActual <= item.stockMinimo && !critico;
      const optimo = item.stockActual > item.stockMinimo;

      if (this.filtroEstado === 'Críticos') return critico;
      if (this.filtroEstado === 'Por Agotarse') return bajo;
      if (this.filtroEstado === 'Óptimos') return optimo;
      
      return true;
    });
  }
}