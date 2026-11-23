import type { ReactNode } from 'react';

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-slate-300">
      <p className="text-base font-semibold text-slate-700">{titulo}</p>
      {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}