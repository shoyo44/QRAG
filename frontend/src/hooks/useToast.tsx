import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';

/* ── Types ── */
type ToastVariant = 'info' | 'success' | 'error';
interface Toast { id: number; message: string; variant: ToastVariant; }

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

/* ── Context ── */
const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/* ── Provider ── */
let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++nextId;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.variant}`}>
            <span>{variantIcon(t.variant)}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function variantIcon(v: ToastVariant) {
  if (v === 'success') return '✓';
  if (v === 'error')   return '✕';
  return 'ℹ';
}
