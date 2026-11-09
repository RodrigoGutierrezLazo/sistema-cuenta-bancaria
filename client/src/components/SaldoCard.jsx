import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, CreditCard, Sparkles, TrendingUp, Shield } from 'lucide-react';

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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl shadow-purple-950/20 border border-purple-500/20">
      
      {/* Círculos decorativos de fondo */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        
        {/* Encabezado de la Tarjeta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
              <div className="w-6 h-4 border border-amber-800/40 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
                <div className="border-r border-b border-amber-800/40"></div>
                <div className="border-b border-amber-800/40"></div>
                <div className="border-r border-amber-800/40"></div>
                <div></div>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                {cuenta?.tipoCuenta || 'Cuenta de Ahorros'}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Estado: <strong className="text-emerald-400 font-semibold">{cuenta?.estado || 'ACTIVA'}</strong></span>
              </div>
            </div>
          </div>

          {/* Botón copiar número de cuenta */}
          <button
            onClick={copiarNumeroCuenta}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-purple-200 border border-white/10 transition-all active:scale-95"
            title="Copiar número de cuenta"
          >
            {copiado ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-purple-300" />
                <span className="font-mono">{cuenta?.numeroCuenta || '---'}</span>
              </>
            )}
          </button>
        </div>

        {/* Sección de Saldo Principal */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Saldo Disponible
              <Sparkles className="w-3 h-3 text-purple-400" />
            </span>
            <button
              onClick={() => setMostrarSaldo(!mostrarSaldo)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title={mostrarSaldo ? 'Ocultar saldo' : 'Mostrar saldo'}
            >
              {mostrarSaldo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            {cargando ? (
              <div className="h-12 w-48 bg-slate-800/80 animate-pulse rounded-lg mt-1"></div>
            ) : mostrarSaldo ? (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-100 bg-clip-text text-transparent font-sans">
                {formatoMoneda(cuenta?.saldo)}
              </h2>
            ) : (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-widest text-slate-400 font-mono">
                S/ ••••••••
              </h2>
            )}
          </div>
        </div>

        {/* Pie de la Tarjeta: Titular y detalles */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Titular de la Cuenta</p>
            <p className="text-sm sm:text-base font-bold text-white tracking-wide">
              {cuenta?.titular || 'Cargando...'}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Moneda Oficial</p>
            <p className="text-xs sm:text-sm font-semibold text-purple-200">
              {cuenta?.moneda === 'PEN' ? 'Soles (S/)' : cuenta?.moneda || 'PEN'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
