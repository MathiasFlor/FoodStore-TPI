import { Button } from '@/shared/ui/Button';

interface PaginacionProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export function Paginacion({
  page,
  limit,
  total,
  onPageChange,
}: PaginacionProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-600">
      <span>
        Página <strong>{page + 1}</strong> de <strong>{totalPages}</strong> ({total}{' '}
        registros)
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}