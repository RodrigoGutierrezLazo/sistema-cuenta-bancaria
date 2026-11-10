import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function HistorialTransacciones({
  transacciones = [],
  cuentaActiva,
  cargando,
}) {
  const [filtroTipo, setFiltroTipo] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');

  const formatoFecha = (fechaStr) => {
    if (!fechaStr) return '---';
    const fecha = new Date(fechaStr);
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha);
  };

  const formatoMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(cantidad || 0);
  };

  const transaccionesFiltradas = transacciones.filter((t) => {
    if (filtroTipo !== 'TODAS' && t.tipo !== filtroTipo) {
      return false;
    }
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase();
      const coincideDesc = t.descripcion?.toLowerCase().includes(q);
      const coincideOrigen = t.cuentaOrigen?.toLowerCase().includes(q);
      const coincideDestino = t.cuentaDestino?.toLowerCase().includes(q);
      const coincideTipo = t.tipo?.toLowerCase().includes(q);
      return coincideDesc || coincideOrigen || coincideDestino || coincideTipo;
    }
    return true;
  });

  return (
    <section className="bg-white border border-[#DEDCD3] rounded-md overflow-hidden">
      
      {/* Cabecera del estado de cuenta */}
      <div className="p-5 sm:p-6 border-b border-[#EAE8E1]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-[#0B192C]">
                Estado de cuenta y movimientos
              </h2>
              <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-[#F5F4F0] text-slate-700 border border-[#DEDCD3]">
                {transacciones.length} {transacciones.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detalle cronológico de operaciones asociadas a la cuenta <span className="font-mono font-medium text-slate-700">{cuentaActiva?.numeroCuenta}</span>
            </p>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar por glosa o cuenta..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F6] border border-[#C8C5BA] rounded text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0B192C] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Pestañas de filtro */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-[#F0EFEA]">
          {[
            { id: 'TODAS', label: 'Todos los movimientos' },
            { id: 'DEPOSITO', label: 'Depósitos' },
            { id: 'RETIRO', label: 'Retiros' },
            { id: 'TRANSFERENCIA', label: 'Transferencias' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroTipo(tab.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filtroTipo === tab.id
                  ? 'bg-[#0B192C] text-white'
                  : 'bg-[#F5F4F0] text-slate-600 hover:bg-[#EAE8E1] hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cuerpo del historial */}
      {cargando ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 bg-stone-100 rounded animate-pulse"></div>
          ))}
        </div>
      ) : transaccionesFiltradas.length === 0 ? (
        <div className="py-14 px-6 text-center">
          <p className="text-sm font-semibold text-slate-800">
            Sin movimientos para mostrar
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {busqueda || filtroTipo !== 'TODAS'
              ? 'No se encontraron registros que coincidan con el criterio de filtrado actual.'
              : 'Aún no existen operaciones registradas en esta cuenta bancaria. Utilice el formulario lateral para registrar un depósito.'}
          </p>
        </div>
      ) : (
        <>
          {/* Vista de tabla para escritorio / tablet */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F4F0] border-b border-[#DEDCD3] text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  <th className="py-3 pl-6 pr-3">Fecha / Hora</th>
                  <th className="py-3 px-3">Operación</th>
                  <th className="py-3 px-3">Concepto y Cuentas</th>
                  <th className="py-3 px-3 text-right">Importe</th>
                  <th className="py-3 pl-3 pr-6 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8E1] text-xs">
                {transaccionesFiltradas.map((t) => {
                  const esDeposito = t.tipo === 'DEPOSITO';
                  const esRetiro = t.tipo === 'RETIRO';
                  const esTransferencia = t.tipo === 'TRANSFERENCIA';
                  const esTransferenciaEnviada = esTransferencia && t.cuentaOrigen === cuentaActiva?.numeroCuenta;
                  const esTransferenciaRecibida = esTransferencia && t.cuentaDestino === cuentaActiva?.numeroCuenta;
                  const esIngreso = esDeposito || esTransferenciaRecibida;

                  return (
                    <tr
                      key={t._id || `${t.tipo}-${t.fecha}`}
                      className="hover:bg-[#FAF9F6] transition-colors"
                    >
                      {/* Fecha */}
                      <td className="py-3.5 pl-6 pr-3 font-mono text-[11px] text-slate-600 whitespace-nowrap tabular-nums">
                        {formatoFecha(t.fecha)}
                      </td>

                      {/* Tipo de operación */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              esIngreso ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                          {esDeposito && 'Depósito'}
                          {esRetiro && 'Retiro'}
                          {esTransferenciaEnviada && 'Transf. enviada'}
                          {esTransferenciaRecibida && 'Transf. recibida'}
                          {esTransferencia && !esTransferenciaEnviada && !esTransferenciaRecibida && 'Transferencia'}
                        </span>
                      </td>

                      {/* Concepto y relación de cuentas */}
                      <td className="py-3.5 px-3">
                        <p className="font-medium text-slate-900">
                          {t.descripcion || 'Operación en cuenta'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {esDeposito && `Destino: ${t.cuentaDestino || cuentaActiva?.numeroCuenta}`}
                          {esRetiro && `Origen: ${t.cuentaOrigen || cuentaActiva?.numeroCuenta}`}
                          {esTransferencia && `${t.cuentaOrigen} → ${t.cuentaDestino}`}
                        </p>
                      </td>

                      {/* Importe */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono font-semibold tabular-nums">
                        <span className={esIngreso ? 'text-emerald-700' : 'text-rose-700'}>
                          {esIngreso ? '+' : '-'} {formatoMoneda(t.monto)}
                        </span>
                      </td>

                      {/* Saldo resultante */}
                      <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap font-mono text-slate-600 tabular-nums">
                        {t.saldoPosterior !== null && t.saldoPosterior !== undefined
                          ? formatoMoneda(t.saldoPosterior)
                          : '---'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vista adaptativa para móviles */}
          <div className="sm:hidden divide-y divide-[#EAE8E1]">
            {transaccionesFiltradas.map((t) => {
              const esDeposito = t.tipo === 'DEPOSITO';
              const esRetiro = t.tipo === 'RETIRO';
              const esTransferencia = t.tipo === 'TRANSFERENCIA';
              const esTransferenciaEnviada = esTransferencia && t.cuentaOrigen === cuentaActiva?.numeroCuenta;
              const esTransferenciaRecibida = esTransferencia && t.cuentaDestino === cuentaActiva?.numeroCuenta;
              const esIngreso = esDeposito || esTransferenciaRecibida;

              return (
                <div key={t._id || `${t.tipo}-${t.fecha}`} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          esIngreso ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                      {esDeposito && 'Depósito'}
                      {esRetiro && 'Retiro'}
                      {esTransferenciaEnviada && `Transf. a ${t.cuentaDestino}`}
                      {esTransferenciaRecibida && `Transf. de ${t.cuentaOrigen}`}
                    </span>

                    <span
                      className={`font-mono text-sm font-semibold tabular-nums ${
                        esIngreso ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {esIngreso ? '+' : '-'} {formatoMoneda(t.monto)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    {t.descripcion || 'Operación registrada'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                    <span>{formatoFecha(t.fecha)}</span>
                    {t.saldoPosterior !== null && t.saldoPosterior !== undefined && (
                      <span>Saldo: {formatoMoneda(t.saldoPosterior)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </section>
  );
}
