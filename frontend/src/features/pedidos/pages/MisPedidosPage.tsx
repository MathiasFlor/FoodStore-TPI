import { useState } from 'react';
import { Link } from 'react-router-dom';
import { handleApiError } from '@/shared/api/handleApiError';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Skeleton } from '@/shared/components/Skeleton';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { Paginacion } from '@/shared/components/Paginacion';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';
import { DetallePedidoModal } from '../components/DetallePedidoModal';
import type { Pedido } from '../types/pedido.types';

const PAGE_LIMIT = 10;

export function MisPedidosPage() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: page * PAGE_LIMIT,
    limit: PAGE_LIMIT,
  });
  const cancelarMutation = useCancelarPedido();

  const pedidos = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleCancelar = async (pedido: Pedido) => {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.id}? Se restituirá el stock.`)) {
      return;
    }
    setActionError(null);
    try {
      await cancelarMutation.mutateAsync(pedido.id);
    } catch (err) {
      setActionError(handleApiError(err));
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mis Pedidos</h1>
        <p className="text-sm text-slate-500">
          Consultá el estado de tus compras o cancelá pedidos pendientes
        </p>
      </div>

      {actionError && <EstadoError mensaje={actionError} />}

      {isLoading ? (
        <Skeleton variant="rows" count={5} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no realizaste pedidos"
          descripcion="Explorá el catálogo para hacer tu primera compra."
          accion={
            <Link
              to="/"
              className="inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Ver catálogo
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <Card
                key={pedido.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Pedido #{pedido.id}</span>
                    <BadgeEstado estado={pedido.estado} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(pedido.created_at).toLocaleString('es-AR')} ·{' '}
                    {pedido.forma_pago} · {pedido.direccion_entrega}
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    Total: ${pedido.total.toLocaleString('es-AR')} ({pedido.items.length}{' '}
                    ítem{pedido.items.length !== 1 ? 's' : ''})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelected(pedido)}
                  >
                    Ver detalle
                  </Button>
                  {pedido.estado === 'PENDIENTE' && (
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={cancelarMutation.isPending}
                      onClick={() => void handleCancelar(pedido)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
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

      {selected && (
        <DetallePedidoModal pedido={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}