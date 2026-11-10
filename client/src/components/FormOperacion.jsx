import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Componente FormOperacion: Formulario modular para Depósitos, Retiros y Transferencias.
 * Controla las entradas mediante useState y valida saldo suficiente antes de enviar.
 */
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

  const cambiarTipoOperacion = (nuevoTipo) => {
    setOperacion(nuevoTipo);
    setMonto('');
    setDescripcion('');
    setErrorLocal('');
    if (nuevoTipo === 'transferencia' && otrasCuentas.length > 0 && !cuentaDestino) {
      setCuentaDestino(otrasCuentas[0].numeroCuenta);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    const montoNumerico = parseFloat(monto);
    const saldoDisponible = cuentaActiva?.saldo || 0;

    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      setErrorLocal('Ingresa un monto positivo mayor a S/ 0.00.');
      return;
    }

    if (operacion === 'retiro' && montoNumerico > saldoDisponible) {
      setErrorLocal(`Saldo insuficiente. Tu disponible es S/ ${saldoDisponible.toFixed(2)}.`);
      return;
    }

    const destinoElegido = cuentaDestino || otrasCuentas[0]?.numeroCuenta || '';
    if (operacion === 'transferencia') {
      if (!destinoElegido) {
        setErrorLocal('Selecciona una cuenta de destino válida.');
        return;
      }
      if (destinoElegido === cuentaActiva?.numeroCuenta) {
        setErrorLocal('No puedes transferir fondos a la misma cuenta de origen.');
        return;
      }
      if (montoNumerico > saldoDisponible) {
        setErrorLocal(`Fondos insuficientes para transferir. Disponible: S/ ${saldoDisponible.toFixed(2)}.`);
        return;
      }
    }

    try {
      await onSubmitOperacion({
        tipo: operacion,
        monto: montoNumerico,
        numeroCuenta: cuentaActiva?.numeroCuenta,
        cuentaOrigen: cuentaActiva?.numeroCuenta,
        cuentaDestino: operacion === 'transferencia' ? destinoElegido : null,
        descripcion: descripcion.trim(),
      });

      setMonto('');
      setDescripcion('');
    } catch (err) {
      setErrorLocal(err.message || 'No se pudo procesar la operación.');
    }
  };

  return (
    <section className="ombria-card p-5 sm:p-6">
      
      {/* Cabecera del panel */}
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight">
          Realizar operación
        </h2>
        <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted)' }}>
          Elige el movimiento bancario que deseas registrar
        </p>
      </div>

      {/* Control segmentado tipo píldora (Ombria .seg) */}
      <div className="ombria-seg grid grid-cols-3 gap-1 mb-5">
        <button
          type="button"
          onClick={() => cambiarTipoOperacion('deposito')}
          className={`ombria-seg-btn h-9 text-xs inline-flex items-center justify-center gap-1.5 ${
            operacion === 'deposito' ? 'is-active' : ''
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Depósito</span>
        </button>

        <button
          type="button"
          onClick={() => cambiarTipoOperacion('retiro')}
          className={`ombria-seg-btn h-9 text-xs inline-flex items-center justify-center gap-1.5 ${
            operacion === 'retiro' ? 'is-active' : ''
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Retiro</span>
        </button>

        <button
          type="button"
          onClick={() => cambiarTipoOperacion('transferencia')}
          className={`ombria-seg-btn h-9 text-xs inline-flex items-center justify-center gap-1.5 ${
            operacion === 'transferencia' ? 'is-active' : ''
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Transferir</span>
        </button>
      </div>

      {/* Aviso de error de validación */}
      {errorLocal && (
        <div
          className="mb-4 p-3 rounded-2xl text-xs font-semibold flex items-start gap-2"
          style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorLocal}</span>
        </div>
      )}

      <form onSubmit={manejarEnvio} className="space-y-4">
        
        {/* Selector de cuenta destino (solo visible en Transferencia) */}
        {operacion === 'transferencia' && (
          <div>
            <label
              htmlFor="select-destino"
              className="block text-xs font-semibold mb-1.5"
              style={{ color: 'var(--ink-2)' }}
            >
              Cuenta de destino
            </label>
            <select
              id="select-destino"
              value={cuentaDestino || otrasCuentas[0]?.numeroCuenta || ''}
              onChange={(e) => setCuentaDestino(e.target.value)}
              className="ombria-input w-full h-11 px-3.5 text-sm font-medium cursor-pointer"
              required
            >
              {otrasCuentas.length === 0 ? (
                <option value="">Sin cuentas disponibles</option>
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

        {/* Campo de monto */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="input-monto"
              className="text-xs font-semibold"
              style={{ color: 'var(--ink-2)' }}
            >
              Monto en Soles (S/)
            </label>
            {operacion !== 'deposito' && (
              <small className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                Disponible: S/ {(cuentaActiva?.saldo || 0).toFixed(2)}
              </small>
            )}
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
            className="ombria-input w-full h-11 px-4 text-lg font-semibold"
            required
          />

          {/* Chips de montos rápidos estilo Ombria */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {montosRapidos.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => {
                  setMonto(valor.toString());
                  setErrorLocal('');
                }}
                className="ombria-chip h-7 px-3 text-xs"
              >
                + S/ {valor}
              </button>
            ))}
          </div>
        </div>

        {/* Campo de concepto / descripción */}
        <div>
          <label
            htmlFor="input-descripcion"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: 'var(--ink-2)' }}
          >
            Descripción o concepto <span style={{ color: 'var(--muted)' }}>(opcional)</span>
          </label>
          <input
            id="input-descripcion"
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder={
              operacion === 'deposito'
                ? 'Ej. Abono de ahorros o sueldo'
                : operacion === 'retiro'
                ? 'Ej. Retiro en ventanilla / cajero'
                : 'Ej. Transferencia a otra cuenta'
            }
            maxLength={90}
            className="ombria-input w-full h-11 px-3.5 text-sm font-medium"
          />
        </div>

        {/* Botón principal tipo píldora */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={procesando || !monto || parseFloat(monto) <= 0}
            className="ombria-btn-primary w-full h-11 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {procesando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>
                Confirmar {operacion === 'deposito' ? 'depósito' : operacion === 'retiro' ? 'retiro' : 'transferencia'}
              </span>
            )}
          </button>
        </div>

      </form>
    </section>
  );
}
