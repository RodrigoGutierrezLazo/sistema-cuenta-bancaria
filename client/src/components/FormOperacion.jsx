import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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

  // Atajos de montos frecuentes
  const montosRapidos = [20, 50, 100, 200, 500];

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
      setErrorLocal('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    if (operacion === 'retiro') {
      if (numMonto > (cuentaActiva?.saldo || 0)) {
        setErrorLocal(`El monto excede tu saldo disponible (S/ ${cuentaActiva?.saldo?.toFixed(2) || '0.00'}).`);
        return;
      }
    }

    if (operacion === 'transferencia') {
      const destinoFinal = cuentaDestino || (otrasCuentas[0]?.numeroCuenta || '');
      if (!destinoFinal) {
        setErrorLocal('Debes seleccionar o ingresar una cuenta de destino.');
        return;
      }
      if (destinoFinal === cuentaActiva?.numeroCuenta) {
        setErrorLocal('No puedes transferirte a la misma cuenta de origen.');
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

      // Limpiar formulario tras éxito
      setMonto('');
      setDescripcion('');
    } catch (err) {
      // El error lo captura el componente padre o se muestra
      setErrorLocal(err.message || 'Error al procesar la operación');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
      
      {/* Título de la Sección */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Centro de Operaciones Bancarias
        </h3>
        <p className="text-xs text-slate-500">
          Selecciona la transacción que deseas efectuar en tu cuenta
        </p>
      </div>

      {/* Selector de Pestañas / Tipo de Operación */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
        
        <button
          type="button"
          onClick={() => handleCambioOperacion('deposito')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            operacion === 'deposito'
              ? 'bg-white text-emerald-700 shadow-sm shadow-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className={`w-4 h-4 ${operacion === 'deposito' ? 'text-emerald-600' : 'text-slate-500'}`} />
          <span>Depósito</span>
        </button>

        <button
          type="button"
          onClick={() => handleCambioOperacion('retiro')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            operacion === 'retiro'
              ? 'bg-white text-rose-700 shadow-sm shadow-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className={`w-4 h-4 ${operacion === 'retiro' ? 'text-rose-600' : 'text-slate-500'}`} />
          <span>Retiro</span>
        </button>

        <button
          type="button"
          onClick={() => handleCambioOperacion('transferencia')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            operacion === 'transferencia'
              ? 'bg-white text-purple-700 shadow-sm shadow-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight className={`w-4 h-4 ${operacion === 'transferencia' ? 'text-purple-600' : 'text-slate-500'}`} />
          <span>Transferencia</span>
        </button>

      </div>

      {/* Alerta de Error Local */}
      {errorLocal && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorLocal}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Campo Cuenta Destino (Solo para Transferencia) */}
        {operacion === 'transferencia' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Cuenta Destinataria
            </label>
            <div className="relative">
              <select
                value={cuentaDestino || (otrasCuentas[0]?.numeroCuenta || '')}
                onChange={(e) => setCuentaDestino(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                required
              >
                {otrasCuentas.length === 0 ? (
                  <option value="">No hay otras cuentas registradas</option>
                ) : (
                  otrasCuentas.map((c) => (
                    <option key={c.numeroCuenta} value={c.numeroCuenta}>
                      {c.numeroCuenta} - {c.titular} ({c.tipoCuenta})
                    </option>
                  ))
                )}
              </select>
            </div>
            <p className="text-[11px] text-slate-500">
              Transferencia inmediata sin comisión entre cuentas del sistema
            </p>
          </div>
        )}

        {/* Campo Monto */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="input-monto" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Monto a {operacion === 'deposito' ? 'depositar' : operacion === 'retiro' ? 'retirar' : 'transferir'}
            </label>
            {operacion !== 'deposito' && (
              <span className="text-xs text-slate-500 font-medium">
                Disponible: <strong className="text-slate-800">S/ {cuentaActiva?.saldo?.toFixed(2) || '0.00'}</strong>
              </span>
            )}
          </div>

          <div className="relative rounded-2xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 font-bold text-lg sm:text-xl">S/</span>
            </div>
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
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-4 py-3 sm:py-3.5 text-lg sm:text-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-300 font-mono"
              required
            />
          </div>
        </div>

        {/* Atajos de Montos Rápidos */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Montos sugeridos:
          </span>
          <div className="flex flex-wrap gap-2">
            {montosRapidos.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => handleMontoRapido(valor)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition-colors"
              >
                +S/ {valor}
              </button>
            ))}
          </div>
        </div>

        {/* Campo Concepto / Descripción */}
        <div className="space-y-1.5">
          <label htmlFor="input-descripcion" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Concepto o Descripción <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <input
            id="input-descripcion"
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder={
              operacion === 'deposito'
                ? 'Ej. Depósito sueldo o ahorro quincenal'
                : operacion === 'retiro'
                ? 'Ej. Retiro de emergencia para compras'
                : 'Ej. Pago de servicios compartidos o préstamo'
            }
            maxLength={100}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
          />
        </div>

        {/* Botón de Acción Principal */}
        <button
          type="submit"
          disabled={procesando || !monto || parseFloat(monto) <= 0}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
            operacion === 'deposito'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-900/20'
              : operacion === 'retiro'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-900/20'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-900/20'
          }`}
        >
          {procesando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Procesando transacción...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>
                Confirmar {operacion === 'deposito' ? 'Depósito' : operacion === 'retiro' ? 'Retiro' : 'Transferencia'}
              </span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
