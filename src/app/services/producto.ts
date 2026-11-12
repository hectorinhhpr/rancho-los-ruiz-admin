import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private supabaseService: SupabaseService) {}

  async getProductos(): Promise<any[] | null> {
    const { data, error } = await this.supabaseService.client
      .from('productos')
      .select('*, inventario(stock_actual)'); 

    if (error) {
      console.error('Error al descargar el catálogo:', error.message);
      return null;
    }

    const productosConStock = data.map((p: any) => {
      const stockTotal = p.inventario && p.inventario.length > 0 
        ? p.inventario.reduce((acc: number, curr: any) => acc + (curr.stock_actual || 0), 0)
        : 0;

      return {
        ...p,
        stock: stockTotal
      };
    });

    return productosConStock;
  }

  async crearProducto(producto: any): Promise<boolean> {
    const { error } = await this.supabaseService.client
      .from('productos')
      .insert([producto]);

    if (error) {
      console.error('Error al crear producto:', error.message);
      return false;
    }
    return true;
  }

  async subirImagenProducto(file: File): Promise<string | null> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await this.supabaseService.client.storage
        .from('productos_imagenes')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicURLData } = this.supabaseService.client.storage
        .from('productos_imagenes')
        .getPublicUrl(data.path);

      return publicURLData.publicUrl;
    } catch (err: any) {
      console.error('Error al subir la imagen:', err.message);
      return null;
    }
  }

  async eliminarProducto(id: string): Promise<boolean> {
    const { error } = await this.supabaseService.client
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar producto:', error.message);
      return false;
    }
    return true;
  }

  // 👈 NUEVA FUNCIÓN: Actualizar producto existente
  async actualizarProducto(id: string, datosActualizados: any): Promise<boolean> {
    const { error } = await this.supabaseService.client
      .from('productos')
      .update(datosActualizados)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar producto:', error.message);
      return false;
    }
    return true;
  }
}