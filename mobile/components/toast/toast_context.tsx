import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastType = 'error' | 'success' | 'info';

type Toast = {
  id:      number;
  message: string;
  type:    ToastType;
};

type ToastContextType = {
  toast: Toast | null;
  show:  (message: string, type?: ToastType) => void;
  hide:  () => void;
};

const ToastContext = createContext<ToastContextType>({
  toast: null,
  show:  () => {},
  hide:  () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef    = useRef(0);

  const hide = useCallback(() => setToast(null), []);

  const show = useCallback((message: string, type: ToastType = 'error') => {
    if (timerRef.current) clearTimeout(timerRef.current);

    idRef.current += 1;
    setToast({ id: idRef.current, message, type });

    timerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, show, hide }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// ── Accès hors composant React (ex: intercepteur axios) ─────────────────────
// Même pattern que authEvents.ts pour éviter les imports circulaires.

let globalShow: ToastContextType['show'] | null = null;

export function registerGlobalToast(show: ToastContextType['show']) {
  globalShow = show;
}

export function showGlobalToast(message: string, type: ToastType = 'error') {
  globalShow?.(message, type);
}