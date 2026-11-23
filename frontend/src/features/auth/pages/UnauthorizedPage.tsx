import { Link } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';

export function UnauthorizedPage() {
  return (
    <Card className="max-w-md mx-auto mt-12 p-8 text-center">
      <p className="text-4xl font-extrabold text-red-600">403</p>
      <h1 className="mt-2 text-xl font-bold text-slate-800">Acceso denegado</h1>
      <p className="mt-2 text-sm text-slate-600">
        No tenés permisos para ingresar a esta sección.
      </p>
      <Link
        to="/"
        className="inline-block mt-6 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
      >
        Volver al catálogo
      </Link>
    </Card>
  );
}