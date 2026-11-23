import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useCartStore } from '@/store/cartStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { useCrearPedido } from '../hooks/usePedidos';
import type { FormaPago } from '../types/pedido.types';

export function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const vaciar = useCartStore((state) => state.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        await crearPedido.mutateAsync({
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
          })),
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim(),
        });
        vaciar();
        navigate('/mis-pedidos', { replace: true });
      } catch (err) {
        setApiError(handleApiError(err));
      }
    },
  });

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No tenés productos en el carrito"
        descripcion="Agregá al menos un producto antes de confirmar un pedido."
        accion={
          <Link
            to="/"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Volver al catálogo
          </Link>
        }
      />
    );
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Confirmar Pedido</h1>
        <p className="text-sm text-slate-500 mb-6">
          Indicá los datos de entrega y la forma de pago
        </p>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="direccion_entrega"
            validators={{
              onSubmit: ({ value }) => {
                const len = value.trim().length;
                if (len < 5) return 'La dirección debe tener al menos 5 caracteres';
                if (len > 200) return 'Máximo 200 caracteres';
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Dirección de entrega *"
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Ej: Av. San Martín 1234, Piso 2"
                error={field.state.meta.errors.filter(Boolean).join(', ') || undefined}
              />
            )}
          </form.Field>

          <form.Field name="forma_pago">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Forma de pago *
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EFECTIVO">Efectivo al recibir</option>
                  <option value="TRANSFERENCIA">Transferencia bancaria</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="notas">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  rows={3}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Sin cebolla, timbre no anda..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </form.Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => navigate('/carrito')}>
              Volver al carrito
            </Button>
            <Button type="submit" disabled={crearPedido.isPending}>
              {crearPedido.isPending ? 'Enviando pedido...' : 'Confirmar pedido'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 h-fit space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Resumen del carrito</h2>
        <ul className="divide-y divide-slate-200 text-sm">
          {items.map((item) => (
            <li key={item.producto_id} className="py-2 flex justify-between gap-2">
              <span className="text-slate-700">
                {item.cantidad}x {item.nombre}
              </span>
              <span className="font-semibold text-slate-900">
                ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
              </span>
            </li>
          ))}
        </ul>
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
          <span className="font-semibold text-slate-700">Total</span>
          <span className="text-xl font-extrabold text-indigo-700">
            ${total.toLocaleString('es-AR')}
          </span>
        </div>
      </Card>
    </section>
  );
}