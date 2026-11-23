interface SkeletonProps {
  count?: number;
  variant?: 'cards' | 'rows';
}

export function Skeleton({ count = 6, variant = 'cards' }: SkeletonProps) {
  if (variant === 'rows') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-200 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="h-44 bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-9 bg-slate-200 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}