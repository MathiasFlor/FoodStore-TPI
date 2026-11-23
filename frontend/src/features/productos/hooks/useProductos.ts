import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '../api/productos';
import type {
  ProductoPayload,
  ProductosFiltros,
  ProductoStockPayload,
} from '../types/producto.types';

export function useProductos(filtros: ProductosFiltros = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => productosApi.getAll(filtros),
  });

  const createMutation = useMutation({
    mutationFn: productosApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoPayload }) =>
      productosApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoStockPayload }) =>
      productosApi.updateStock(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productosApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  return {
    data: query.data,
    productos: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createProducto: createMutation.mutateAsync,
    updateProducto: updateMutation.mutateAsync,
    updateStock: stockMutation.mutateAsync,
    deleteProducto: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isUpdatingStock: stockMutation.isPending,
  };
}