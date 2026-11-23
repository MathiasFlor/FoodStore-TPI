import { useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { handleApiError } from '@/shared/api/handleApiError';
import { DataTable } from '@/shared/components/DataTable';
import { Skeleton } from '@/shared/components/Skeleton';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { Button } from '@/shared/ui/Button';
import { useProductos } from '../hooks/useProductos';
import { ProductoModal } from '../components/ProductoModal';
import { StockModal } from '../components/StockModal';
import type {
  Producto,
  ProductoPayload,
  ProductoStockPayload,
} from '../types/producto.types';

export function AdminProductosPage() {
  const { categorias } = useCategorias();
  const {
    productos,
    isLoading,
    isError,
    error,
    refetch,
    createProducto,
    updateProducto,
    updateStock,
    deleteProducto,
    isSaving,
    isUpdatingStock,
  } = useProductos({ skip: 0, limit: 100 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [stockTarget, setStockTarget] = useState<Producto | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const openCreate = () => {
    setEditing(null);
    setModalError(null);
    setIsFormOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditing(p);
    setModalError(null);
    setIsFormOpen(true);
  };

  const openStock = (p: Producto) => {
    setStockTarget(p);
    setModalError(null);
  };

  const handleSave = async (values: ProductoPayload) => {
    setModalError(null);
    try {
      if (editing) {
        await updateProducto({ id: editing.id, payload: values });
      } else {
        await createProducto(values);
      }
      setIsFormOpen(false);
    } catch (err) {
      setModalError(handleApiError(err));
    }
  };

  const handleStockSave = async (values: ProductoStockPayload) => {
    if (!stockTarget) return;
    setModalError(null);
    try {
      await updateStock({ id: stockTarget.id, payload: values });
      setStockTarget(null);
    } catch (err) {
      setModalError(handleApiError(err));
    }
  };

  const handleDelete = async (p: Producto) => {
    if (!window.confirm(`¿Dar de baja el producto "${p.nombre}"?`)) return;
    setActionError(null);
    try {
      await deleteProducto(p.id);
    } catch (err) {
      setActionError(handleApiError(err));
    }
  };

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', enableSorting: true },
      { accessorKey: 'nombre', header: 'Nombre', enableSorting: true },
      {
        id: 'categoria',
        header: 'Categoría',
        enableSorting: false,
        cell: ({ row }) => row.original.categoria.nombre,
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        enableSorting: true,
        cell: ({ getValue }) => `$${Number(getValue()).toLocaleString('es-AR')}`,
      },
      { accessorKey: 'stock', header: 'Stock', enableSorting: true },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        enableSorting: true,
        cell: ({ getValue }) =>
          getValue() ? (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
              Sí
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 text-slate-600">
              No
            </span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            <Button variant="secondary" size="sm" onClick={() => openEdit(row.original)}>
              Editar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => openStock(row.original)}>
              Stock
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
    data: productos,
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
          <h1 className="text-2xl font-bold text-slate-800">Administrar Productos</h1>
          <p className="text-sm text-slate-500">
            ABM de productos, control de stock y disponibilidad
          </p>
        </div>
        <Button onClick={openCreate}>+ Nuevo producto</Button>
      </div>

      {actionError && <EstadoError mensaje={actionError} />}

      {isLoading ? (
        <Skeleton variant="rows" count={6} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : productos.length === 0 ? (
        <EstadoVacio titulo="No hay productos activos" />
      ) : (
        <DataTable table={table} />
      )}

      {isFormOpen && (
        <ProductoModal
          initialData={editing}
          categorias={categorias}
          isSubmitting={isSaving}
          apiError={modalError}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSave}
        />
      )}

      {stockTarget && (
        <StockModal
          producto={stockTarget}
          isSubmitting={isUpdatingStock}
          apiError={modalError}
          onClose={() => setStockTarget(null)}
          onSubmit={handleStockSave}
        />
      )}
    </section>
  );
}