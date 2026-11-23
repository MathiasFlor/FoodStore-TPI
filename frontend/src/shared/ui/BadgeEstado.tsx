interface BadgeEstadoProps {
  estado: string;
}

const ESTILOS: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-700',
};

const ETIQUETAS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const cls = ESTILOS[estado] ?? 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
      {ETIQUETAS[estado] ?? estado}
    </span>
  );
}