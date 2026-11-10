import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Navbar({
  cuentas = [],
  cuentaActiva,
  onSeleccionarCuenta,
  cargando,
  onRecargar,
}) {
  return (
    <header className="bg-[#0B192C] text-stone-100 border-b border-[#1E3350]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 sm:h-16 gap-3">
          
          {/* Identidad institucional */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white text-[#0B192C] flex items-center justify-center font-display font-bold text-sm tracking-tighter shrink-0">
                BC
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-display font-semibold text-base tracking-tight text-white">
                  Banca en Línea
                </span>
                <span className="hidden md:inline text-slate-500 text-xs">|</span>
                <span className="hidden md:inline text-xs text-slate-300 font-normal">
                  Gestión de Cuentas y Tesorería
                </span>
              </div>
            </div>

            <button
              onClick={onRecargar}
              disabled={cargando}
              className="sm:hidden p-1.5 rounded border border-slate-700 text-slate-300 hover:text-white"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Controles de sesión y selector de cuenta */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <label
                htmlFor="select-cuenta"
                className="text-[11px] uppercase tracking-wider text-slate-400 font-medium shrink-0"
              >
                Cuenta:
              </label>
              <select
                id="select-cuenta"
                value={cuentaActiva?.numeroCuenta || ''}
                onChange={(e) => onSeleccionarCuenta(e.target.value)}
                className="w-full sm:w-auto bg-[#132640] border border-[#264163] hover:border-slate-500 rounded px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-stone-300 transition-colors cursor-pointer"
                aria-label="Seleccionar cuenta activa"
              >
                {cuentas.map((c) => (
                  <option key={c.numeroCuenta} value={c.numeroCuenta} className="bg-[#0B192C] text-white">
                    {c.numeroCuenta} — {c.titular}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onRecargar}
              disabled={cargando}
              title="Sincronizar saldo y movimientos"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#132640] hover:bg-[#1B3354] text-slate-200 border border-[#264163] text-xs font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
