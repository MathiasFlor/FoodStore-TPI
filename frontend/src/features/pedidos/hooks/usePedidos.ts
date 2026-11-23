import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedidosApi } from '../api/pedidos';
import type {
  EstadoPedido,
  PedidoCreatePayload,
  PedidosFiltros,
} from '../types/pedido.types';

export function usePedidos(filtros: PedidosFiltros = {}) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => pedidosApi.getAll(filtros),
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PedidoCreatePayload) => pedidosApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
    },
  });
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      pedidosApi.cambiarEstado(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pedidosApi.cancelar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
    },
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['pedidos-resumen'],
    queryFn: pedidosApi.resumen,
  });
}