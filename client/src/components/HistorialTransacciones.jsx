import React, { useState } from 'react';
import { Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

/**
 * Componente HistorialTransacciones: Lista detallada de los movimientos de la cuenta.
 * Muestra tipo de operación, monto, fecha/hora y cuentas de origen/destino.
 */
export default function HistorialTransacciones({
  transacciones = [],
  cuentaActiva,
  cargando,
}) {
  const [filtroTipo, setFiltroTipo] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return '---';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fechaIso));
  };

  const formatearMoneda = (monto) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(monto || 0);

  // Filtrado por categoría y término de búsqueda
  const listaFiltrada = transacciones.filter((t) => {
    if (filtroTipo !== 'TODAS' && t.tipo !== filtroTipo) return false;
    if (!busqueda.trim()) return true;

    const texto = busqueda.toLowerCase();
    return (
      t.descripcion?.toLowerCase().includes(texto) ||
      t.cuentaOrigen?.toLowerCase().includes(texto) ||
      t.cuentaDestino?.toLowerCase().includes(texto) ||
      t.tipo?.toLowerCase().includes(texto)
    );
  });

  const categorias = [
    { id: 'TODAS', label: 'Todos' },
    { id: 'DEPOSITO', label: 'Depósitos' },
    { id: 'RETIRO', label: 'Retiros' },
    { id: 'TRANSFERENCIA', label: 'Transferencias' },
  ];

  return (
    <section className="ombria-card p-5 sm:p-6">
      
      {/* Cabecera y buscador estilo Ombria */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">
              Historial de movimientos
            </h2>
            <span className="ombria-pill ombria-pill--neutral">
              {transacciones.length}
            </span>
          </div>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted)' }}>
            Últimas transacciones de la cuenta {cuentaActiva?.numeroCuenta}
          </p>
        </div>

        <div className="relative w-full sm:w-56">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--muted)' }}
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar movimiento..."
            className="ombria-input w-full h-9 pl-9 pr-3.5 text-xs font-medium rounded-full"
          />
        </div>
      </div>

      {/* Chips de filtro */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFiltroTipo(cat.id)}
            className={`ombria-chip h-8 px-3.5 text-xs ${
              filtroTipo === cat.id ? 'is-active' : ''
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Contenido de la lista / tabla */}
      {cargando ? (
        <div className="space-y-2.5 py-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-14 rounded-2xl animate-pulse"
              style={{ background: 'var(--card-2)' }}
            />
          ))}
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="ombria-well py-12 px-4 text-center">
          <b className="text-sm font-semibold block">Sin movimientos registrados</b>
          <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: 'var(--muted)' }}>
            No se encontraron transacciones con los filtros seleccionados en esta cuenta.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="text-xs font-semibold border-b"
                style={{ color: 'var(--muted)', borderColor: 'var(--line)' }}
              >
                <th className="pb-2.5 pl-2 pr-3">Operación y detalle</th>
                <th className="pb-2.5 px-3 hidden md:table-cell">Cuentas</th>
                <th className="pb-2.5 px-3 hidden sm:table-cell">Fecha</th>
                <th className="pb-2.5 pl-3 pr-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--line)' }}>
              {listaFiltrada.map((t) => {
                const esDeposito = t.tipo === 'DEPOSITO';
                const esRetiro = t.tipo === 'RETIRO';
                const esTransferencia = t.tipo === 'TRANSFERENCIA';
                const esRecibida = esTransferencia && t.cuentaDestino === cuentaActiva?.numeroCuenta;
                const esIngreso = esDeposito || esRecibida;

                return (
                  <tr
                    key={t._id || `${t.tipo}-${t.fecha}`}
                    className="transition-colors"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    {/* Columna 1: Icono, tipo y descripción */}
                    <td className="py-3.5 pl-2 pr-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
                          style={{
                            background: esIngreso ? 'var(--good-soft)' : 'var(--bad-soft)',
                            color: esIngreso ? 'var(--good)' : 'var(--bad)',
                          }}
                        >
                          {esDeposito && <ArrowDownLeft className="w-4 h-4" />}
                          {esRetiro && <ArrowUpRight className="w-4 h-4" />}
                          {esTransferencia && <ArrowLeftRight className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0">
                          <b className="text-sm font-semibold block truncate">
                            {esDeposito && 'Depósito de fondos'}
                            {esRetiro && 'Retiro de fondos'}
                            {esTransferencia && (esRecibida ? 'Transferencia recibida' : 'Transferencia enviada')}
                          </b>
                          <small className="text-xs block truncate" style={{ color: 'var(--muted)' }}>
                            {t.descripcion || 'Sin concepto adicional'}
                          </small>
                          <small className="text-[11px] sm:hidden block mt-0.5" style={{ color: 'var(--muted)' }}>
                            {formatearFecha(t.fecha)}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* Columna 2: Origen / Destino */}
                    <td className="py-3.5 px-3 hidden md:table-cell whitespace-nowrap">
                      <span className="ombria-pill ombria-pill--neutral">
                        {esDeposito && `Destino: ${t.cuentaDestino}`}
                        {esRetiro && `Origen: ${t.cuentaOrigen}`}
                        {esTransferencia && `${t.cuentaOrigen} → ${t.cuentaDestino}`}
                      </span>
                    </td>

                    {/* Columna 3: Fecha y hora */}
                    <td
                      className="py-3.5 px-3 text-xs font-semibold hidden sm:table-cell whitespace-nowrap"
                      style={{ color: 'var(--muted)' }}
                    >
                      {formatearFecha(t.fecha)}
                    </td>

                    {/* Columna 4: Monto y saldo resultante */}
                    <td className="py-3.5 pl-3 pr-2 text-right whitespace-nowrap">
                      <span
                        className="text-sm font-semibold block"
                        style={{ color: esIngreso ? 'var(--good)' : 'var(--bad)' }}
                      >
                        {esIngreso ? '+' : '-'} {formatearMoneda(t.monto)}
                      </span>
                      {t.saldoPosterior !== null && t.saldoPosterior !== undefined && (
                        <small className="text-xs font-medium block" style={{ color: 'var(--muted)' }}>
                          Saldo: {formatearMoneda(t.saldoPosterior)}
                        </small>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </section>
  );
}
