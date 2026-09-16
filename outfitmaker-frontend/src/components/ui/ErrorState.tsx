import type { ReactNode } from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

/** Friendly, non-technical error state. Raw exceptions are never shown. */
export function ErrorState({
  title = 'Something went wrong.',
  message = 'We couldn’t load this right now. Please try again.',
  actionLabel = 'Retry',
  onAction,
  children,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-line bg-white/60 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-burgundy/10 text-2xl text-burgundy">
        !
      </div>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-slate-soft">{message}</p>
      {children}
      {onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
