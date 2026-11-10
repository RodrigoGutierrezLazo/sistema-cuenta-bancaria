import React from 'react';
import { Landmark, RefreshCw, Sun, Moon } from 'lucide-react';

/**
 * Componente Navbar: Barra superior flotante estilo Ombria.
 * Permite cambiar la cuenta activa, sincronizar datos y alternar el tema visual.
 */
export default function Navbar({
  cuentas = [],
  cuentaActiva,
  onSeleccionarCuenta,
  cargando,
  onRecargar,
  tema = 'dark',
  onCambiarTema,
}) {
  // Iniciales del titular para el avatar circular estilo Ombria
  const obtenerIniciales = (nombre = '') =>
    nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || 'BC';

  return (
    <header className="sticky top-4 z-30 max-w-6xl w-full mx-auto px-4 sm:px-6">
      <div className="ombria-top h-16 px-3 sm:px-4 flex items-center justify-between gap-3">
        
        {/* Marca principal */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            <Landmark className="w-5 h-5" />
          </div>

          <div className="truncate">
            <span className="font-bold text-lg tracking-tight block leading-none">
              Ombria Bank
            </span>
            <small className="text-xs font-semibold block mt-1" style={{ color: 'var(--muted)' }}>
              Ingeniería Web · Gestión Bancaria
            </small>
          </div>
        </div>

        {/* Selector de cuenta activa y herramientas */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          <div className="flex items-center gap-2">
            <span
              className="hidden md:inline text-xs font-semibold"
              style={{ color: 'var(--muted)' }}
            >
              Cuenta activa:
            </span>
            <select
              id="select-cuenta"
              value={cuentaActiva?.numeroCuenta || ''}
              onChange={(e) => onSeleccionarCuenta(e.target.value)}
              className="ombria-input h-10 px-3.5 text-xs sm:text-sm font-semibold cursor-pointer rounded-full"
              aria-label="Seleccionar cuenta bancaria"
            >
              {cuentas.map((c) => (
                <option key={c.numeroCuenta} value={c.numeroCuenta}>
                  {c.numeroCuenta} · {c.titular}
                </option>
              ))}
            </select>
          </div>

          {/* Botón circular para sincronizar con el backend */}
          <button
            type="button"
            onClick={onRecargar}
            disabled={cargando}
            title="Sincronizar saldo y movimientos"
            className="ombria-ibtn shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>

          {/* Botón circular para cambiar entre tema Oscuro y Claro (como en Ombria) */}
          <button
            type="button"
            onClick={onCambiarTema}
            title={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="ombria-ibtn shrink-0"
          >
            {tema === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Avatar circular del titular */}
          <div
            className="hidden sm:grid w-10 h-10 rounded-full place-items-center text-xs font-bold shrink-0"
            style={{
              background: '#e6d6c4',
              color: '#1b1b1b',
              boxShadow: '0 0 0 2px var(--glass-rim)',
            }}
            title={cuentaActiva?.titular || 'Titular'}
          >
            {obtenerIniciales(cuentaActiva?.titular)}
          </div>

        </div>

      </div>
    </header>
  );
}
