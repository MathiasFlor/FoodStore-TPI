import { Button } from '@/shared/ui/Button';

interface EstadoErrorProps {
  mensaje: string;
  onRetry?: () => void;
}

export function EstadoError({ mensaje, onRetry }: EstadoErrorProps) {
  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-sm">Ocurrió un error</p>
        <p className="text-sm text-red-700">{mensaje}</p>
      </div>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}