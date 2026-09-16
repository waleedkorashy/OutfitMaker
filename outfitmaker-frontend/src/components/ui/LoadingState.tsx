/** Generic loading placeholder for page/grid regions. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex items-center gap-2">
        <span className="ai-dot" />
        <span className="ai-dot [animation-delay:150ms]" />
        <span className="ai-dot [animation-delay:300ms]" />
      </div>
      <p className="text-sm text-slate-soft">{label}</p>
    </div>
  );
}

/** Grid skeleton used while products load. */
export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-2xl bg-sand" />
          <div className="mt-3 h-4 w-3/4 rounded bg-sand" />
          <div className="mt-2 h-4 w-1/3 rounded bg-sand" />
        </div>
      ))}
    </div>
  );
}
