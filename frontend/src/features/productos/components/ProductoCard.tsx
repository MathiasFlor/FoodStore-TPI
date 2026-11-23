import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import type { Producto } from '../types/producto.types';

interface ProductoCardProps {
  producto: Producto;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((state) => state.agregar);
  const enCarrito = useCartStore(
    (state) => state.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );
  const [agregadoFeedback, setAgregadoFeedback] = useState(false);

  const sinStock = !producto.disponible || producto.stock <= 0;
  const topeAlcanzado = enCarrito >= producto.stock;

  const handleAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      stock: producto.stock,
      imagen_url: producto.imagen_url,
    });
    setAgregadoFeedback(true);
    window.setTimeout(() => setAgregadoFeedback(false), 1200);
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="h-44 bg-slate-100 relative overflow-hidden">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Sin imagen
          </div>
        )}
        <span className="absolute top-2 left-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-white/90 text-indigo-700 shadow-xs">
          {producto.categoria.nombre}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">{producto.nombre}</h3>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2">
            {producto.descripcion || 'Sin descripción'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-extrabold text-slate-900">
              ${producto.precio_base.toLocaleString('es-AR')}
            </span>
            <span
              className={`text-xs font-medium ${
                sinStock ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {sinStock ? 'No disponible' : `Stock: ${producto.stock}`}
            </span>
          </div>

          <Button
            onClick={handleAgregar}
            disabled={sinStock || topeAlcanzado}
            variant={agregadoFeedback ? 'success' : 'primary'}
            className="w-full"
          >
            {sinStock
              ? 'Sin stock'
              : topeAlcanzado
                ? `Máximo en carrito (${enCarrito})`
                : agregadoFeedback
                  ? '✓ Agregado'
                  : enCarrito > 0
                    ? `Agregar otro (${enCarrito} en carrito)`
                    : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  );
}