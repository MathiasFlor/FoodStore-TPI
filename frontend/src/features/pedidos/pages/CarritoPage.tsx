import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { EstadoVacio } from '@/shared/components/EstadoVacio';

export function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);
  const vaciar = useCartStore((state) => state.vaciar);
  const total = useCartStore((state) => state.total());
  const usuario = useAuthStore((state) => state.usuario);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Recorré el catálogo y agregá productos para armar tu pedido."
        accion={
          <Link
            to="/"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Ir al catálogo
          </Link>
        }
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tu Carrito</h1>
          <p className="text-sm text-slate-500">
            Revisá las cantidades antes de confirmar tu pedido
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card className="divide-y divide-slate-200">
        {items.map((item) => (
          <div
            key={item.producto_id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              {item.imagen_url ? (
                <img
                  src={item.imagen_url}
                  alt={item.nombre}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Sin foto
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-800">{item.nombre}</p>
                <p className="text-sm text-slate-500">
                  ${item.precio_unitario.toLocaleString('es-AR')} c/u (stock disp.:{' '}
                  {item.stock})
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm font-semibold">{item.cantidad}</span>
                <button
                  type="button"
                  disabled={item.cantidad >= item.stock}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-100 font-bold disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>

              <p className="w-24 text-right font-bold text-slate-900">
                ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
              </p>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => quitar(item.producto_id)}
              >
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Total a pagar</p>
          <p className="text-2xl font-extrabold text-slate-900">
            ${total.toLocaleString('es-AR')}
          </p>
        </div>

        <Button
          onClick={() => navigate(usuario ? '/checkout' : '/login')}
          className="px-6 py-2.5"
        >
          {usuario ? 'Continuar al checkout' : 'Iniciar sesión para comprar'}
        </Button>
      </Card>
    </section>
  );
}