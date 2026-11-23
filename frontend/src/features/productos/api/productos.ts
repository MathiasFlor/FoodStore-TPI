import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  Producto,
  ProductoPayload,
  ProductosFiltros,
  ProductosPaginados,
  ProductoStockPayload,
} from '../types/producto.types';

export const productosApi = {
  getAll: async (filtros: ProductosFiltros = {}): Promise<ProductosPaginados> => {
    const params: Record<string, string | number | boolean> = {};
    if (filtros.skip !== undefined) params.skip = filtros.skip;
    if (filtros.limit !== undefined) params.limit = filtros.limit;
    if (filtros.search && filtros.search.trim()) params.search = filtros.search.trim();
    if (filtros.categoria_id !== undefined) params.categoria_id = filtros.categoria_id;
    if (filtros.disponible !== undefined) params.disponible = filtros.disponible;

    const { data } = await axiosInstance.get<ProductosPaginados>('/productos', { params });
    return data;
  },

  create: async (payload: ProductoPayload): Promise<Producto> => {
    const { data } = await axiosInstance.post<Producto>('/productos', payload);
    return data;
  },

  update: async (id: number, payload: ProductoPayload): Promise<Producto> => {
    const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, payload);
    return data;
  },

  updateStock: async (id: number, payload: ProductoStockPayload): Promise<Producto> => {
    const { data } = await axiosInstance.patch<Producto>(
      `/productos/${id}/stock`,
      payload,
    );
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/productos/${id}`);
  },
};