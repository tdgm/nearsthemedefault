"use client";
// Client Component: fila de mensagens em estado + temporizador de auto-fechamento.
// A regiao aria-live existe desde a montagem (leitores de tela so anunciam
// mudancas em regioes ja presentes no DOM).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '../cn';

export type ToastTone = 'info' | 'success' | 'danger';
export type ToastMessage = { id: number; message: string; tone: ToastTone };

type ToastApi = { show: (message: string, tone?: ToastTone) => void };
const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  return ctx;
}

const tones: Record<ToastTone, string> = {
  info: 'border-info',
  success: 'border-success',
  danger: 'border-danger',
};

export type ToastProviderProps = {
  children: ReactNode;
  /** Tempo ate fechar sozinho, em ms. */
  duration?: number;
  dismissLabel?: string;
};

export function ToastProvider({ children, duration = 5000, dismissLabel = 'Dispensar aviso' }: ToastProviderProps) {
  const [items, setItems] = useState<ToastMessage[]>([]);
  const counter = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = ++counter.current;
      setItems((list) => [...list, { id, message, tone }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    },
    [dismiss, duration],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 grid gap-2 sm:left-auto sm:w-96">
        {items.map((t) => (
          <div key={t.id} className={cn('flex items-center justify-between gap-2 rounded-md border-l-4 bg-surface-inverse p-3 text-on-inverse', tones[t.tone])}>
            <p>{t.message}</p>
            <button type="button" aria-label={dismissLabel} onClick={() => dismiss(t.id)} className="inline-flex size-11 shrink-0 items-center justify-center">
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
