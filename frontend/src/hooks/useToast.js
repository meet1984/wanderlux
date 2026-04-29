// hooks/useToast.js — Lightweight toast notification system
import { useState, useCallback, useEffect } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return { toasts, toast };
}

// Toast renderer component (place once in App)
export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;

  const styles = {
    success: 'border-green-500/30 bg-green-500/10 text-green-400',
    error:   'border-red-500/30 bg-red-500/10 text-red-400',
    info:    'border-sand/30 bg-sand/10 text-sand',
  };

  const icons = { success: '✓', error: '✕', info: 'i' };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md
                      font-body text-sm shadow-lg animate-fade-up pointer-events-auto
                      ${styles[t.type] || styles.info}`}
        >
          <span className="font-bold text-xs w-4 h-4 rounded-full border border-current
                           flex items-center justify-center flex-shrink-0">
            {icons[t.type]}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
