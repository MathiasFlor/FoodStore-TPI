import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  EstadoPedido,
  Pedido,
  PedidoCreatePayload,
  PedidosFiltros,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido.types';

export const pedidosApi = {
  create: async (payload: PedidoCreatePayload): Promise<Pedido> => {
    const { data } = await axiosInstance.post<Pedido>('/pedidos', payload);
    return data;
  },

  getAll: async (filtros: PedidosFiltros = {}): Promise<PedidosPaginados> => {
    const params: Record<string, string | number> = {};
    if (filtros.skip !== undefined) params.skip = filtros.skip;
    if (filtros.limit !== undefined) params.limit = filtros.limit;
    if (filtros.estado) params.estado = filtros.estado;
    const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', { params });
    return data;
  },

  getById: async (id: number): Promise<Pedido> => {
    const { data } = await axiosInstance.get<Pedido>(`/pedidos/${id}`);
    return data;
  },

  cambiarEstado: async (id: number, estado: EstadoPedido): Promise<Pedido> => {
    const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, {
      estado,
    });
    return data;
  },

  cancelar: async (id: number): Promise<Pedido> => {
    const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
    return data;
  },

  resumen: async (): Promise<ResumenPedidos> => {
    const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen');
    return data;
  },
};