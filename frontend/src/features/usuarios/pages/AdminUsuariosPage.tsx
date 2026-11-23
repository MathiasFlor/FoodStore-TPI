import { useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { UserPublic } from '@/features/auth/types/auth.types';
import { useAuthStore } from '@/store/authStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { DataTable } from '@/shared/components/DataTable';
import { Skeleton } from '@/shared/components/Skeleton';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { Button } from '@/shared/ui/Button';
import { useUsuarios } from '../hooks/useUsuarios';

export function AdminUsuariosPage() {
  const currentUser = useAuthStore((state) => state.usuario);
  const {
    usuarios,
    isLoading,
    isError,
    error,
    refetch,
    activarUsuario,
    desactivarUsuario,
    isMutating,
  } = useUsuarios();

  const [actionError, setActionError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleToggle = async (u: UserPublic) => {
    setActionError(null);
    try {
      if (u.disabled) {
        await activarUsuario(u.id);
      } else {
        await desactivarUsuario(u.id);
      }
    } catch (err) {
      setActionError(handleApiError(err));
    }
  };

  const columns = useMemo<ColumnDef<UserPublic>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario', enableSorting: true },
      { accessorKey: 'full_name', header: 'Nombre', enableSorting: true },
      { accessorKey: 'email', header: 'Email', enableSorting: true },
      {
        accessorKey: 'role',
        header: 'Rol',
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 uppercase">
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        enableSorting: true,
        cell: ({ getValue }) =>
          getValue() ? (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
              Desactivado
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
              Activo
            </span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = currentUser?.id === u.id;
          if (isSelf) {
            return <span className="text-xs text-slate-400">Tu cuenta</span>;
          }
          return u.disabled ? (
            <Button
              variant="success"
              size="sm"
              disabled={isMutating}
              onClick={() => void handleToggle(u)}
            >
              Activar
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              disabled={isMutating}
              onClick={() => void handleToggle(u)}
            >
              Desactivar
            </Button>
          );
        },
      },
    ],
    [currentUser?.id, isMutating],
  );

  const table = useReactTable({
    data: usuarios,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
        <p className="text-sm text-slate-500">
          Activá o desactivá cuentas registradas en el sistema
        </p>
      </div>

      {actionError && <EstadoError mensaje={actionError} />}

      {isLoading ? (
        <Skeleton variant="rows" count={5} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : usuarios.length === 0 ? (
        <EstadoVacio titulo="No hay usuarios registrados" />
      ) : (
        <DataTable table={table} />
      )}
    </section>
  );
}