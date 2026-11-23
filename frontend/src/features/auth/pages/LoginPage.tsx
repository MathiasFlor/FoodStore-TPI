import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useAuthStore } from '@/store/authStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';

export function LoginPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const login = useAuthStore((state) => state.login);
  const procesando = useAuthStore((state) => state.procesando);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setApiError(null);
      try {
        await login(value.username.trim(), value.password);
        navigate('/', { replace: true });
      } catch (err) {
        setApiError(handleApiError(err));
      }
    },
  });

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return (
    <Card className="max-w-md mx-auto mt-6 p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Iniciar sesión</h1>
      <p className="text-sm text-slate-500 mb-6">
        Ingresá con tu usuario y contraseña
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
              !value.trim() ? 'El nombre de usuario es obligatorio' : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Usuario"
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej: admin"
              error={field.state.meta.errors.filter(Boolean).join(', ') || undefined}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onSubmit: ({ value }) =>
              !value ? 'La contraseña es obligatoria' : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Contraseña"
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.filter(Boolean).join(', ') || undefined}
            />
          )}
        </form.Field>

        <Button type="submit" disabled={procesando} className="w-full py-2.5">
          {procesando ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="text-indigo-600 font-medium hover:underline">
          Registrate acá
        </Link>
      </p>
    </Card>
  );
}