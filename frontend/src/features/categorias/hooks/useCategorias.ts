import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../api/categorias';
import type { CategoriaPayload } from '../types/categoria.types';

export function useCategorias() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: categoriasApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaPayload }) =>
      categoriasApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  return {
    categorias: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createCategoria: createMutation.mutateAsync,
    updateCategoria: updateMutation.mutateAsync,
    deleteCategoria: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}