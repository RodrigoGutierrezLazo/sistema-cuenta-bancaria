import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function AlertNotification({ mensaje, tipo = 'exito', onClose }) {
  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [mensaje, onClose]);

  if (!mensaje) return null;

  const esExito = tipo === 'exito';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-bounce-short">
      <div
        className={`p-4 rounded-2xl shadow-xl border flex items-start justify-between gap-3 backdrop-blur-md ${
          esExito
            ? 'bg-emerald-900/95 text-white border-emerald-500/50 shadow-emerald-950/40'
            : 'bg-rose-900/95 text-white border-rose-500/50 shadow-rose-950/40'
        }`}
      >
        <div className="flex items-start gap-3">
          {esExito ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {esExito ? 'Transacción Exitosa' : 'Aviso del Sistema'}
            </h5>
            <p className="text-sm font-medium text-white mt-0.5">{mensaje}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white p-1 transition-colors rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
