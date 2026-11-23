import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { authApi } from '../api/auth';
import { handleApiError } from '@/shared/api/handleApiError';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      setSubmitting(true);
      try {
        await authApi.register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        navigate('/login', { replace: true });
      } catch (err) {
        setApiError(handleApiError(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Card className="max-w-md mx-auto mt-6 p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Crear cuenta</h1>
      <p className="text-sm text-slate-500 mb-6">
        Completá tus datos para hacer pedidos en Food Store
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
          name="username"
          validators={{
            onSubmit: ({ value }) =>
              value.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Usuario *"
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej: juanperez"
              error={field.state.meta.errors.filter(Boolean).join(', ') || undefined}
            />
          )}
        </form.Field>

        <form.Field
          name="full_name"
          validators={{
            onSubmit: ({ value }) =>
              value.trim().length < 2 ? 'Ingresá tu nombre completo' : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Nombre completo *"
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej: Juan Pérez"
              error={field.state.meta.errors.filter(Boolean).join(', ') || undefined}
            />
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onSubmit: ({ value }) =>
              !value.includes('@') ? 'Ingresá un email válido' : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Email *"
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="juan@ejemplo.com"
              error={field.state.meta.errors.filter(Boolean).join(', ') || undefined}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length > 0 && value.length < 8
                ? 'Mínimo 8 caracteres'
                : undefined,
            onSubmit: ({ value }) =>
              value.length < 8
                ? 'La contraseña debe tener al menos 8 caracteres'
                : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Contraseña *"
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.filter(Boolean).join(', ') || undefined}
            />
          )}
        </form.Field>

        <Button type="submit" disabled={submitting} className="w-full py-2.5">
          {submitting ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </Card>
  );
}