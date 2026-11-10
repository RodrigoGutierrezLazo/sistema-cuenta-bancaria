import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function FormOperacion({
  cuentaActiva,
  otrasCuentas = [],
  onSubmitOperacion,
  procesando,
}) {
  const [operacion, setOperacion] = useState('deposito'); // 'deposito' | 'retiro' | 'transferencia'
  const [monto, setMonto] = useState('');
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errorLocal, setErrorLocal] = useState('');

  const montosRapidos = [50, 100, 200, 500];

  const handleMontoRapido = (valor) => {
    setMonto(valor.toString());
    setErrorLocal('');
  };

  const handleCambioOperacion = (tipo) => {
    setOperacion(tipo);
    setMonto('');
    setDescripcion('');
    setErrorLocal('');
    if (tipo === 'transferencia' && otrasCuentas.length > 0 && !cuentaDestino) {
      setCuentaDestino(otrasCuentas[0].numeroCuenta);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    const numMonto = parseFloat(monto);

    if (isNaN(numMonto) || numMonto <= 0) {
      setErrorLocal('Ingrese un importe válido mayor a S/ 0.00.');
      return;
    }

    if (operacion === 'retiro') {
      if (numMonto > (cuentaActiva?.saldo || 0)) {
        setErrorLocal(`Fondos insuficientes. Su saldo disponible es S/ ${cuentaActiva?.saldo?.toFixed(2) || '0.00'}.`);
        return;
      }
    }

    if (operacion === 'transferencia') {
      const destinoFinal = cuentaDestino || (otrasCuentas[0]?.numeroCuenta || '');
      if (!destinoFinal) {
        setErrorLocal('Seleccione una cuenta de destino válida.');
        return;
      }
      if (destinoFinal === cuentaActiva?.numeroCuenta) {
        setErrorLocal('La cuenta de destino no puede ser igual a la cuenta de origen.');
        return;
      }
      if (numMonto > (cuentaActiva?.saldo || 0)) {
        setErrorLocal(`Saldo insuficiente para transferir. Disponible: S/ ${cuentaActiva?.saldo?.toFixed(2) || '0.00'}.`);
        return;
      }
    }

    try {
      await onSubmitOperacion({
        tipo: operacion,
        monto: numMonto,
        cuentaOrigen: cuentaActiva?.numeroCuenta,
        cuentaDestino: operacion === 'transferencia' ? (cuentaDestino || otrasCuentas[0]?.numeroCuenta) : null,
        numeroCuenta: cuentaActiva?.numeroCuenta,
        descripcion: descripcion.trim(),
      });

      setMonto('');
      setDescripcion('');
    } catch (err) {
      setErrorLocal(err.message || 'No se pudo completar la operación.');
    }
  };

  return (
    <section className="bg-white border border-[#DEDCD3] rounded-md p-5 sm:p-6">
      
      <div className="pb-4 mb-5 border-b border-[#EAE8E1] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0B192C]">
            Registrar operación
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Seleccione el tipo de transacción y complete los datos requeridos
          </p>
        </div>
      </div>

      {/* Selector segmentado de operación */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#F5F4F0] border border-[#DEDCD3] rounded mb-5">
        {[
          { id: 'deposito', label: 'Depósito' },
          { id: 'retiro', label: 'Retiro' },
          { id: 'transferencia', label: 'Transferencia' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleCambioOperacion(tab.id)}
            className={`py-2 px-3 rounded-xs text-xs font-semibold transition-colors ${
              operacion === tab.id
                ? 'bg-[#0B192C] text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mensaje de validación */}
      {errorLocal && (
        <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorLocal}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Cuenta Destino (solo en transferencias) */}
        {operacion === 'transferencia' && (
          <div>
            <label
              htmlFor="select-destino"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Cuenta de destino
            </label>
            <select
              id="select-destino"
              value={cuentaDestino || (otrasCuentas[0]?.numeroCuenta || '')}
              onChange={(e) => setCuentaDestino(e.target.value)}
              className="w-full bg-white border border-[#C8C5BA] rounded px-3 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C] transition-colors"
              required
            >
              {otrasCuentas.length === 0 ? (
                <option value="">Sin cuentas destinatarias disponibles</option>
              ) : (
                otrasCuentas.map((c) => (
                  <option key={c.numeroCuenta} value={c.numeroCuenta}>
                    {c.numeroCuenta} — {c.titular} ({c.tipoCuenta})
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Importe */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-monto" className="block text-xs font-semibold text-slate-700">
              Importe de la operación (PEN)
            </label>
            {operacion !== 'deposito' && (
              <span className="text-[11px] text-slate-500 tabular-nums">
                Máx. disponible: <strong className="text-slate-800">S/ {cuentaActiva?.saldo?.toFixed(2) || '0.00'}</strong>
              </span>
            )}
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-mono text-sm font-medium pointer-events-none">
              S/
            </span>
            <input
              id="input-monto"
              type="number"
              step="0.01"
              min="0.01"
              value={monto}
              onChange={(e) => {
                setMonto(e.target.value);
                setErrorLocal('');
              }}
              placeholder="0.00"
              className="w-full bg-white border border-[#C8C5BA] rounded pl-10 pr-3.5 py-2.5 text-base font-mono font-semibold text-slate-900 tabular-nums focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C] placeholder:text-slate-300 transition-colors"
              required
            />
          </div>

          {/* Importes rápidos */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-500 mr-1">Importes rápidos:</span>
            {montosRapidos.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => handleMontoRapido(valor)}
                className="px-2 py-0.5 rounded border border-[#DEDCD3] bg-[#F5F4F0] hover:bg-[#EAE8E1] text-slate-700 font-mono text-xs font-medium transition-colors"
              >
                S/ {valor}
              </button>
            ))}
          </div>
        </div>

        {/* Glosa / Referencia */}
        <div>
          <label htmlFor="input-descripcion" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Concepto o referencia <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            id="input-descripcion"
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder={
              operacion === 'deposito'
                ? 'Ej. Abono en efectivo / ahorros'
                : operacion === 'retiro'
                ? 'Ej. Disposición de efectivo'
                : 'Ej. Cancelación de factura o transferencia'
            }
            maxLength={100}
            className="w-full bg-white border border-[#C8C5BA] rounded px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B192C] focus:ring-1 focus:ring-[#0B192C] transition-colors"
          />
        </div>

        {/* Botón de ejecución */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={procesando || !monto || parseFloat(monto) <= 0}
            className="w-full py-2.5 px-4 rounded bg-[#0B192C] hover:bg-[#152A47] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {procesando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando operación...</span>
              </>
            ) : (
              <span>
                Ejecutar {operacion === 'deposito' ? 'depósito' : operacion === 'retiro' ? 'retiro' : 'transferencia'}
              </span>
            )}
          </button>
        </div>

      </form>
    </section>
  );
}
