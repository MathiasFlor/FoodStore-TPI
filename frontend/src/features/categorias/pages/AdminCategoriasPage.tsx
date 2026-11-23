import { useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { handleApiError } from '@/shared/api/handleApiError';
import { DataTable } from '@/shared/components/DataTable';
import { Skeleton } from '@/shared/components/Skeleton';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { Button } from '@/shared/ui/Button';
import { useCategorias } from '../hooks/useCategorias';
import { CategoriaModal } from '../components/CategoriaModal';
import type { Categoria, CategoriaPayload } from '../types/categoria.types';

export function AdminCategoriasPage() {
  const {
    categorias,
    isLoading,
    isError,
    error,
    refetch,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    isSaving,
  } = useCategorias();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const openCreate = () => {
    setEditing(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Categoria) => {
    setEditing(cat);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (cat: Categoria) => {
    if (!window.confirm(`¿Dar de baja la categoría "${cat.nombre}"?`)) return;
    setActionError(null);
    try {
      await deleteCategoria(cat.id);
    } catch (err) {
      setActionError(handleApiError(err));
    }
  };

  const handleSave = async (values: CategoriaPayload) => {
    setModalError(null);
    try {
      if (editing) {
        await updateCategoria({ id: editing.id, payload: values });
      } else {
        await createCategoria(values);
      }
      setIsModalOpen(false);
    } catch (err) {
      setModalError(handleApiError(err));
    }
  };

  const columns = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', enableSorting: true },
      { accessorKey: 'nombre', header: 'Nombre', enableSorting: true },
      { accessorKey: 'descripcion', header: 'Descripción', enableSorting: false },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => openEdit(row.original)}>
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => void handleDelete(row.original)}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: categorias,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Administrar Categorías</h1>
          <p className="text-sm text-slate-500">Alta, edición y baja lógica de categorías</p>
        </div>
        <Button onClick={openCreate}>+ Nueva categoría</Button>
      </div>

      {actionError && <EstadoError mensaje={actionError} />}

      {isLoading ? (
        <Skeleton variant="rows" count={5} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : categorias.length === 0 ? (
        <EstadoVacio titulo="No hay categorías activas" />
      ) : (
        <DataTable table={table} />
      )}

      {isModalOpen && (
        <CategoriaModal
          initialData={editing}
          isSubmitting={isSaving}
          apiError={modalError}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
        />
      )}
    </section>
  );
}