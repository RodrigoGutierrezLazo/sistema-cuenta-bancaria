import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Calendar, 
  Receipt, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Search,
  Wallet
} from 'lucide-react';

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
      month: 'short',
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

  // Filtrado reactivo
  const transaccionesFiltradas = transacciones.filter((t) => {
    // Filtro por tipo
    if (filtroTipo !== 'TODAS' && t.tipo !== filtroTipo) {
      return false;
    }
    // Búsqueda por texto (descripción, cuentas)
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
      
      {/* Encabezado y Contador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Historial de Movimientos
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {transacciones.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro detallado de transacciones asociadas a la cuenta {cuentaActiva?.numeroCuenta}
          </p>
        </div>

        {/* Buscador Rápido */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar concepto o cuenta..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-medium">
        {[
          { id: 'TODAS', label: 'Todas' },
          { id: 'DEPOSITO', label: 'Depósitos' },
          { id: 'RETIRO', label: 'Retiros' },
          { id: 'TRANSFERENCIA', label: 'Transferencias' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFiltroTipo(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filtroTipo === tab.id
                ? 'bg-white text-purple-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de Transacciones */}
      {cargando ? (
        <div className="space-y-3 py-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : transaccionesFiltradas.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No se registran movimientos</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {busqueda || filtroTipo !== 'TODAS'
              ? 'No hay transacciones que coincidan con los filtros seleccionados.'
              : 'Esta cuenta aún no tiene movimientos bancarios registrados. Realiza un depósito para comenzar.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden">
          {transaccionesFiltradas.map((t) => {
            const esDeposito = t.tipo === 'DEPOSITO';
            const esRetiro = t.tipo === 'RETIRO';
            const esTransferencia = t.tipo === 'TRANSFERENCIA';
            
            // Determinar si una transferencia fue enviada o recibida por la cuenta activa
            const esTransferenciaEnviada = esTransferencia && t.cuentaOrigen === cuentaActiva?.numeroCuenta;
            const esTransferenciaRecibida = esTransferencia && t.cuentaDestino === cuentaActiva?.numeroCuenta;

            const esIngreso = esDeposito || esTransferenciaRecibida;

            return (
              <div
                key={t._id || `${t.tipo}-${t.fecha}`}
                className="py-3.5 sm:py-4 px-2 sm:px-3 hover:bg-slate-50 rounded-2xl transition-colors flex items-center justify-between gap-4"
              >
                {/* Icono y Detalles */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      esIngreso
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {esDeposito && <ArrowDownLeft className="w-5 h-5" />}
                    {esRetiro && <ArrowUpRight className="w-5 h-5" />}
                    {esTransferencia && <ArrowLeftRight className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {esDeposito && 'Depósito en Cuenta'}
                        {esRetiro && 'Retiro de Efectivo'}
                        {esTransferenciaEnviada && `Transferencia a ${t.cuentaDestino || 'Tercero'}`}
                        {esTransferenciaRecibida && `Transferencia de ${t.cuentaOrigen || 'Tercero'}`}
                        {esTransferencia && !esTransferenciaEnviada && !esTransferenciaRecibida && 'Transferencia Interbancaria'}
                      </p>

                      <span
                        className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          esIngreso
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {t.tipo}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {t.descripcion || 'Sin descripción'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatoFecha(t.fecha)}
                      </span>
                      {t.saldoPosterior !== null && t.saldoPosterior !== undefined && (
                        <span className="hidden md:inline text-slate-400">
                          • Saldo restante: S/ {Number(t.saldoPosterior).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Monto */}
                <div className="text-right shrink-0">
                  <span
                    className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                      esIngreso ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {esIngreso ? '+' : '-'} {formatoMoneda(t.monto)}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {esIngreso ? 'Abonado' : 'Debitado'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
