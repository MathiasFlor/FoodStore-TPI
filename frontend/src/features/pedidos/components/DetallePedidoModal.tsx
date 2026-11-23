import { Modal } from '@/shared/ui/Modal';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import type { Pedido } from '../types/pedido.types';

interface DetallePedidoModalProps {
  pedido: Pedido;
  onClose: () => void;
}

export function DetallePedidoModal({ pedido, onClose }: DetallePedidoModalProps) {
  return (
    <Modal title={`Pedido #${pedido.id}`} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Fecha</p>
            <p className="font-medium text-slate-800">
              {new Date(pedido.created_at).toLocaleString('es-AR')}
            </p>
          </div>
          <BadgeEstado estado={pedido.estado} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg">
          <div>
            <p className="text-xs text-slate-500">Dirección de entrega</p>
            <p className="font-medium text-slate-800">{pedido.direccion_entrega}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Forma de pago</p>
            <p className="font-medium text-slate-800">{pedido.forma_pago}</p>
          </div>
          {pedido.notas && (
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500">Notas</p>
              <p className="text-slate-700">{pedido.notas}</p>
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold text-slate-800 mb-2">Ítems del pedido</p>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2 text-center">Cant.</th>
                  <th className="px-3 py-2 text-right">Precio unit.</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pedido.items.map((item) => (
                  <tr key={item.producto_id}>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {item.nombre_producto}
                    </td>
                    <td className="px-3 py-2 text-center">{item.cantidad}</td>
                    <td className="px-3 py-2 text-right">
                      ${item.precio_unitario.toLocaleString('es-AR')}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      ${item.subtotal.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <p className="text-lg font-extrabold text-slate-900">
            Total: ${pedido.total.toLocaleString('es-AR')}
          </p>
        </div>
      </div>
    </Modal>
  );
}