import React from 'react';
import { Landmark, User, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Navbar({
  cuentas = [],
  cuentaActiva,
  onSeleccionarCuenta,
  cargando,
  onRecargar,
}) {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-900/40">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
                  BancoOnline
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-950 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-purple-400" /> Web Banking
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Ingeniería Web • Sistema de Gestión de Cuenta Bancaria
              </p>
            </div>
          </div>

          {/* Selector de Cuentas y Estado */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Selector de cuenta para pruebas fáciles */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-inner">
              <User className="w-4 h-4 text-purple-400 hidden sm:block" />
              <label htmlFor="select-cuenta" className="text-xs text-slate-400 font-medium hidden lg:inline">
                Cuenta:
              </label>
              <select
                id="select-cuenta"
                value={cuentaActiva?.numeroCuenta || ''}
                onChange={(e) => onSeleccionarCuenta(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
                aria-label="Seleccionar cuenta de usuario"
              >
                {cuentas.map((c) => (
                  <option key={c.numeroCuenta} value={c.numeroCuenta} className="bg-slate-900 text-white py-1">
                    {c.numeroCuenta} - {c.titular}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Refrescar */}
            <button
              onClick={onRecargar}
              disabled={cargando}
              title="Actualizar datos de la cuenta"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5 text-xs font-medium active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-purple-400' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            {/* Badge de conexión */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online</span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
