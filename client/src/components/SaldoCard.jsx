import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

export default function SaldoCard({ cuenta, cargando }) {
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const copiarNumeroCuenta = () => {
    if (!cuenta?.numeroCuenta) return;
    navigator.clipboard.writeText(cuenta.numeroCuenta);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const formatoMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(cantidad || 0);
  };

  return (
    <section className="bg-white border border-[#DEDCD3] rounded-md overflow-hidden">
      
      {/* Franja superior de identificación de cuenta */}
      <div className="bg-[#0B192C] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#1E3350]">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
            Cuenta {cuenta?.tipoCuenta || 'Ahorros'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-xs font-medium text-white">
            {cuenta?.numeroCuenta || '---'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copiarNumeroCuenta}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#152A47] hover:bg-[#1E3A5F] text-[11px] text-slate-200 border border-[#29466B] transition-colors"
            title="Copiar número de cuenta"
          >
            {copiado ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-300" />
                <span>Copiar N.°</span>
              </>
            )}
          </button>

          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/70">
            {cuenta?.estado || 'ACTIVA'}
          </span>
        </div>
      </div>

      {/* Cuerpo principal de saldo */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Saldo disponible
          </span>
          <button
            onClick={() => setMostrarSaldo(!mostrarSaldo)}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            title={mostrarSaldo ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            {mostrarSaldo ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ocultar</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Mostrar</span>
              </>
            )}
          </button>
        </div>

        <div className="my-1">
          {cargando ? (
            <div className="h-10 w-44 bg-stone-200 animate-pulse rounded"></div>
          ) : mostrarSaldo ? (
            <p className="font-display text-3xl sm:text-4xl font-bold text-[#0B192C] tabular-nums tracking-tight">
              {formatoMoneda(cuenta?.saldo)}
            </p>
          ) : (
            <p className="font-mono text-3xl sm:text-4xl font-semibold text-slate-400 tracking-widest">
              S/ ••••••••
            </p>
          )}
        </div>

        {/* Metadatos del titular */}
        <div className="mt-6 pt-4 border-t border-[#EAE8E1] grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">
              Titular registrado
            </span>
            <span className="font-semibold text-slate-900">
              {cuenta?.titular || 'Cargando...'}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">
              Moneda oficial
            </span>
            <span className="font-medium text-slate-800">
              {cuenta?.moneda === 'PEN' ? 'Soles (PEN)' : cuenta?.moneda || 'Soles (PEN)'}
            </span>
          </div>
        </div>
      </div>

    </section>
  );
}
