import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Componente AlertNotification: Notificación flotante centrada (estilo Ombria .toast).
 */
export default function AlertNotification({ mensaje, tipo = 'exito', onClose }) {
  useEffect(() => {
    if (!mensaje) return;
    const temporizador = setTimeout(onClose, 3800);
    return () => clearTimeout(temporizador);
  }, [mensaje, onClose]);

  if (!mensaje) return null;

  const esExito = tipo === 'exito';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
      <div
        className="pointer-events-auto rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl font-semibold text-sm"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
        }}
      >
        {esExito ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 shrink-0" />
        )}
        <span className="flex-1 text-xs sm:text-sm leading-snug">{mensaje}</span>
        <button
          type="button"
          onClick={onClose}
          className="h-7 px-3 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(127, 127, 127, 0.24)' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
