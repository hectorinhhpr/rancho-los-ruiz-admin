import { Cliente } from './cliente.model';

export interface Reservacion {
  id?: string;
  cliente_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  monto_total: number;
  notas?: string;
  created_at?: string;
  cliente?: Cliente;
}