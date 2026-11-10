import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AlertNotification({ mensaje, tipo = 'exito', onClose }) {
  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [mensaje, onClose]);

  if (!mensaje) return null;

  const esExito = tipo === 'exito';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full px-4 sm:px-0">
      <div
        className={`p-3.5 rounded border shadow-md flex items-start justify-between gap-3 ${
          esExito
            ? 'bg-[#0B192C] text-white border-[#1E3350]'
            : 'bg-rose-950 text-white border-rose-800'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              esExito ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              {esExito ? 'Confirmación de operación' : 'Error en la operación'}
            </p>
            <p className="text-xs text-stone-100 mt-0.5 leading-relaxed">
              {mensaje}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
