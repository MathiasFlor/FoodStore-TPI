import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../api/usuarios';

export function useUsuarios() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: usuariosApi.getAll,
  });

  const activarMutation = useMutation({
    mutationFn: usuariosApi.activar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
    },
  });

  const desactivarMutation = useMutation({
    mutationFn: usuariosApi.desactivar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
    },
  });

  return {
    usuarios: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    activarUsuario: activarMutation.mutateAsync,
    desactivarUsuario: desactivarMutation.mutateAsync,
    isMutating: activarMutation.isPending || desactivarMutation.isPending,
  };
}