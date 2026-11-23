import { useForm } from '@tanstack/react-form';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import type { Categoria, CategoriaPayload } from '../types/categoria.types';

interface CategoriaModalProps {
  initialData: Categoria | null;
  isSubmitting: boolean;
  apiError: string | null;
  onClose: () => void;
  onSubmit: (values: CategoriaPayload) => Promise<void>;
}

export function CategoriaModal({
  initialData,
  isSubmitting,
  apiError,
  onClose,
  onSubmit,
}: CategoriaModalProps) {
  const isEditing = initialData !== null;

  const form = useForm({
    defaultValues: {
      nombre: initialData?.nombre ?? '',
      descripcion: initialData?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      });
    },
  });

  const validateNombre = ({ value }: { value: string }) => {
    const len = value.trim().length;
    if (len < 2) return 'Mínimo 2 caracteres';
    if (len > 100) return 'Máximo 100 caracteres';
    return undefined;
  };

  return (
    <Modal
      title={isEditing ? 'Editar categoría' : 'Nueva categoría'}
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
          validators={{ onChange: validateNombre, onSubmit: validateNombre }}
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

        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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