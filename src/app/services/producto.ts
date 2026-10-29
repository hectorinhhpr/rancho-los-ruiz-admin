import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private supabaseService: SupabaseService) {}

  // Obtener todos los productos junto con su stock real de la tabla de inventario
  async getProductos(): Promise<any[] | null> {
    const { data, error } = await this.supabaseService.client
      .from('productos')
      .select('*, inventario(stock_actual)'); // 👈 Relacionamos con inventario

    if (error) {
      console.error('Error al descargar el catálogo:', error.message);
      return null;
    }

    // Mapeamos el stock sumando los almacenes o dejando 0 si no se ha dado de alta
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

  // Registrar un nuevo producto en el catálogo
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

  // Subir imagen al Storage de Supabase
  async subirImagenProducto(file: File): Promise<string | null> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await this.supabaseService.client.storage
        .from('productos_imagenes')
        .upload(fileName, file);

      if (error) throw error;

      // Obtener la URL pública de la imagen
      const { data: publicURLData } = this.supabaseService.client.storage
        .from('productos_imagenes')
        .getPublicUrl(data.path);

      return publicURLData.publicUrl;
    } catch (err: any) {
      console.error('Error al subir la imagen:', err.message);
      return null;
    }
  }
}