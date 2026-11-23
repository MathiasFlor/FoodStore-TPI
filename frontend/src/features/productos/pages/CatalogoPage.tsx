import { useState } from 'react';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { handleApiError } from '@/shared/api/handleApiError';
import { Skeleton } from '@/shared/components/Skeleton';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { Paginacion } from '@/shared/components/Paginacion';
import { useProductos } from '../hooks/useProductos';
import { ProductoCard } from '../components/ProductoCard';

const PAGE_LIMIT = 6;

export function CatalogoPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const { categorias } = useCategorias();
  const { productos, total, isLoading, isError, error, refetch } = useProductos({
    skip: page * PAGE_LIMIT,
    limit: PAGE_LIMIT,
    search,
    categoria_id: categoriaId,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleCategoriaChange = (value: string) => {
    setCategoriaId(value ? Number(value) : undefined);
    setPage(0);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catálogo</h1>
          <p className="text-sm text-slate-500">
            Elegí tus platos favoritos y armá tu pedido
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar producto..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-64"
          />
          <select
            value={categoriaId ?? ''}
            onChange={(e) => handleCategoriaChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton variant="cards" count={PAGE_LIMIT} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : productos.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron productos"
          descripcion="Probá cambiando la búsqueda o seleccionando otra categoría."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>

          <Paginacion
            page={page}
            limit={PAGE_LIMIT}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}