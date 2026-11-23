import { handleApiError } from '@/shared/api/handleApiError';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/components/Skeleton';
import { EstadoError } from '@/shared/components/EstadoError';
import { useResumenPedidos } from '../hooks/usePedidos';

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos();

  if (isLoading) {
    return <Skeleton variant="cards" count={6} />;
  }

  if (isError || !data) {
    return (
      <EstadoError
        mensaje={handleApiError(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  const tarjetas = [
    {
      label: 'Pendientes',
      valor: String(data.pendientes),
      color: 'text-amber-600',
    },
    {
      label: 'En preparación',
      valor: String(data.en_preparacion),
      color: 'text-blue-600',
    },
    {
      label: 'Entregados',
      valor: String(data.entregados),
      color: 'text-emerald-600',
    },
    {
      label: 'Cancelados',
      valor: String(data.cancelados),
      color: 'text-red-600',
    },
    {
      label: 'Pedidos de hoy',
      valor: String(data.pedidos_hoy),
      color: 'text-indigo-600',
    },
    {
      label: 'Ingresos (entregados)',
      valor: `$${data.ingresos_entregados.toLocaleString('es-AR')}`,
      color: 'text-emerald-700',
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Resumen del Negocio</h1>
        <p className="text-sm text-slate-500">
          Indicadores generales de pedidos e ingresos entregados
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tarjetas.map((t) => (
          <Card key={t.label} className="p-6">
            <p className="text-sm font-medium text-slate-500">{t.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${t.color}`}>{t.valor}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}