import { useForm } from '@tanstack/react-form';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import type { Producto, ProductoStockPayload } from '../types/producto.types';

interface StockModalProps {
  producto: Producto;
  isSubmitting: boolean;
  apiError: string | null;
  onClose: () => void;
  onSubmit: (values: ProductoStockPayload) => Promise<void>;
}

export function StockModal({
  producto,
  isSubmitting,
  apiError,
  onClose,
  onSubmit,
}: StockModalProps) {
  const form = useForm({
    defaultValues: {
      stock: producto.stock,
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        stock: Number(value.stock),
        disponible: value.disponible,
      });
    },
  });

  return (
    <Modal
      title={`Stock: ${producto.nombre}`}
      onClose={onClose}
      maxWidth="max-w-sm"
    >
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
          name="stock"
          validators={{
            onSubmit: ({ value }) =>
              Number.isNaN(value) || value < 0
                ? 'El stock no puede ser negativo'
                : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Stock actual *"
              type="number"
              value={Number.isNaN(field.state.value) ? '' : field.state.value}
              onChange={(e) =>
                field.handleChange(
                  e.target.value === '' ? Number.NaN : Number(e.target.value),
                )
              }
              error={field.state.meta.errors.filter(Boolean).join(', ') || undefined}
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Actualizando...' : 'Actualizar stock'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}