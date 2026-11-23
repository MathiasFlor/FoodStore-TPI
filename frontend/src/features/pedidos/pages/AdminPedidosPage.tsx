import { useState } from 'react';
import { handleApiError } from '@/shared/api/handleApiError';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Skeleton } from '@/shared/components/Skeleton';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { Paginacion } from '@/shared/components/Paginacion';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import { DetallePedidoModal } from '../components/DetallePedidoModal';
import type { EstadoPedido, Pedido } from '../types/pedido.types';

const PAGE_LIMIT = 10;

export function AdminPedidosPage() {
  const [page, setPage] = useState(0);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: page * PAGE_LIMIT,
    limit: PAGE_LIMIT,
    estado: estadoFiltro || undefined,
  });
  const cambiarEstadoMutation = useCambiarEstadoPedido();

  const pedidos = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleCambiarEstado = async (pedidoId: number, nuevoEstado: EstadoPedido) => {
    if (
      nuevoEstado === 'CANCELADO' &&
      !window.confirm(`¿Cancelar el pedido #${pedidoId}? Se restituirá el stock.`)
    ) {
      return;
    }
    setActionError(null);
    try {
      await cambiarEstadoMutation.mutateAsync({ id: pedidoId, estado: nuevoEstado });
    } catch (err) {
      setActionError(handleApiError(err));
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Pedidos</h1>
          <p className="text-sm text-slate-500">
            Avanzá o cancelá pedidos según la máquina de estados
          </p>
        </div>

        <select
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {actionError && <EstadoError mensaje={actionError} />}

      {isLoading ? (
        <Skeleton variant="rows" count={6} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : pedidos.length === 0 ? (
        <EstadoVacio titulo="No hay pedidos para el filtro seleccionado" />
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Dirección / Pago</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold">#{p.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                      {new Date(p.created_at).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{p.direccion_entrega}</p>
                      <p className="text-xs text-slate-500">{p.forma_pago}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ${p.total.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado estado={p.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelected(p)}
                        >
                          Detalle
                        </Button>

                        {p.estado === 'PENDIENTE' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={cambiarEstadoMutation.isPending}
                              onClick={() =>
                                void handleCambiarEstado(p.id, 'EN_PREPARACION')
                              }
                            >
                              Preparar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={cambiarEstadoMutation.isPending}
                              onClick={() =>
                                void handleCambiarEstado(p.id, 'CANCELADO')
                              }
                            >
                              Cancelar
                            </Button>
                          </>
                        )}

                        {p.estado === 'EN_PREPARACION' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              disabled={cambiarEstadoMutation.isPending}
                              onClick={() =>
                                void handleCambiarEstado(p.id, 'ENTREGADO')
                              }
                            >
                              Entregar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={cambiarEstadoMutation.isPending}
                              onClick={() =>
                                void handleCambiarEstado(p.id, 'CANCELADO')
                              }
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

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