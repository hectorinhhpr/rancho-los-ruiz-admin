import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Producto } from '../models/producto.model'; // Asegúrate de que esta ruta sea correcta según tu proyecto

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly BUCKET_NAME = 'productos_imagenes';

  constructor(private supabaseService: SupabaseService) {}

  // Método que consultará el lector de código de barras desde el POS (Creado por Héctor)
  async getProductoByCodigo(codigo: string): Promise<Producto | null> {
    const { data, error } = await this.supabaseService.client
      .from('productos')
      .select('*')
      .eq('codigo_barras', codigo)
      .single();

    if (error) {
      console.error('Error al buscar el producto por código:', error.message);
      return null;
    }

    return data;
  }

  // Método para traer todos los productos y pintar los botones en el POS (Creado por Héctor)
  async getProductos(): Promise<any[] | null> {
    const { data, error } = await this.supabaseService.client
      .from('productos')
      .select('*');

    if (error) {
      console.error('Error al descargar el catálogo:', error.message);
      return null;
    }

    return data;
  }

  // NUEVO: Subir foto de producto a Supabase Storage y retornar la URL pública
  async subirImagenProducto(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `catalogo/${fileName}`;

    const { error: uploadError } = await this.supabaseService.client.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('Error al subir la imagen:', uploadError.message);
      return null;
    }

    const { data } = this.supabaseService.client.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // NUEVO: Crear un nuevo producto en la tabla 'productos'
  async crearProducto(producto: Partial<Producto>): Promise<Producto | null> {
    const { data, error } = await this.supabaseService.client
      .from('productos')
      .insert([producto])
      .select()
      .single();

    if (error) {
      console.error('Error al crear el producto:', error.message);
      return null;
    }

    return data;
  }
}