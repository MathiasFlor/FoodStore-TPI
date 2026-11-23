import { useForm } from '@tanstack/react-form';
import type { Categoria } from '@/features/categorias/types/categoria.types';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import type { Producto, ProductoPayload } from '../types/producto.types';

interface ProductoModalProps {
  initialData: Producto | null;
  categorias: Categoria[];
  isSubmitting: boolean;
  apiError: string | null;
  onClose: () => void;
  onSubmit: (values: ProductoPayload) => Promise<void>;
}

export function ProductoModal({
  initialData,
  categorias,
  isSubmitting,
  apiError,
  onClose,
  onSubmit,
}: ProductoModalProps) {
  const isEditing = initialData !== null;

  const form = useForm({
    defaultValues: {
      nombre: initialData?.nombre ?? '',
      descripcion: initialData?.descripcion ?? '',
      precio_base: initialData?.precio_base ?? 0,
      imagen_url: initialData?.imagen_url ?? '',
      stock: initialData?.stock ?? 0,
      disponible: initialData?.disponible ?? true,
      categoria_id: initialData?.categoria_id ?? (categorias[0]?.id ?? 0),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim(),
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      });
    },
  });

  return (
    <Modal
      title={isEditing ? 'Editar producto' : 'Nuevo producto'}
      onClose={onClose}
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
          name="nombre"
          validators={{
            onSubmit: ({ value }) =>
              !value.trim() ? 'El nombre es obligatorio' : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Nombre *"
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.filter(Boolean).join(', ') || undefined}
            />
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onSubmit: ({ value }) =>
              !value || value <= 0 ? 'Seleccioná una categoría' : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoría *
              </label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>Seleccionar categoría...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  {field.state.meta.errors.filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="precio_base"
            validators={{
              onSubmit: ({ value }) =>
                Number.isNaN(value) || value < 0
                  ? 'El precio debe ser mayor o igual a 0'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Precio base *"
                type="number"
                step="0.01"
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

          <form.Field
            name="stock"
            validators={{
              onSubmit: ({ value }) =>
                Number.isNaN(value) || value < 0
                  ? 'El stock debe ser mayor o igual a 0'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Stock *"
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
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              label="URL de imagen"
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://..."
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
            {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}