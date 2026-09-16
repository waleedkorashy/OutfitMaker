import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-line bg-white/50 px-6 py-16 text-center">
      {icon && <div className="text-4xl text-slate-faint">{icon}</div>}
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      {message && <p className="max-w-sm text-sm text-slate-soft">{message}</p>}
      {actionLabel && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
