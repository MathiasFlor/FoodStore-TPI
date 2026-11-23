import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Categoria, CategoriaPayload } from '../types/categoria.types';

export const categoriasApi = {
  getAll: async (): Promise<Categoria[]> => {
    const { data } = await axiosInstance.get<Categoria[]>('/categorias');
    return data;
  },
  create: async (payload: CategoriaPayload): Promise<Categoria> => {
    const { data } = await axiosInstance.post<Categoria>('/categorias', payload);
    return data;
  },
  update: async (id: number, payload: CategoriaPayload): Promise<Categoria> => {
    const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/categorias/${id}`);
  },
};