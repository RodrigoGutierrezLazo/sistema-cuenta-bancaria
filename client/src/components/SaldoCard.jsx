import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Wallet } from 'lucide-react';

/**
 * Componente SaldoCard: Muestra el saldo actual y los datos principales de la cuenta.
 * Se actualiza inmediatamente tras cualquier depósito, retiro o transferencia.
 */
export default function SaldoCard({ cuenta, cargando }) {
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const copiarNumeroCuenta = () => {
    if (!cuenta?.numeroCuenta) return;
    navigator.clipboard.writeText(cuenta.numeroCuenta);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  const formatearMoneda = (monto) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(monto || 0);

  return (
    <section className="ombria-card p-5 sm:p-6">
      
      {/* Encabezado de la tarjeta: Tipo de cuenta y estado */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl grid place-items-center"
            style={{ background: 'var(--card-2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}
          >
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold block leading-tight">
              Cuenta de {cuenta?.tipoCuenta || 'Ahorros'}
            </span>
            <small className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Moneda: Soles ({cuenta?.moneda || 'PEN'})
            </small>
          </div>
        </div>

        <span className="ombria-pill ombria-pill--good">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {cuenta?.estado || 'ACTIVA'}
        </span>
      </div>

      {/* Bloque central: Saldo disponible */}
      <div className="ombria-well p-4 sm:p-5 mb-5 flex items-center justify-between gap-4">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-wider block mb-1"
            style={{ color: 'var(--muted)' }}
          >
            Saldo disponible
          </span>

          {cargando ? (
            <div
              className="h-9 w-40 rounded-lg animate-pulse"
              style={{ background: 'var(--card-3)' }}
            />
          ) : (
            <strong className="text-3xl sm:text-4xl font-semibold tracking-tight block">
              {mostrarSaldo ? formatearMoneda(cuenta?.saldo) : 'S/ ••••••••'}
            </strong>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMostrarSaldo(!mostrarSaldo)}
          className="ombria-ibtn shrink-0"
          title={mostrarSaldo ? 'Ocultar saldo' : 'Mostrar saldo'}
        >
          {mostrarSaldo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Pie de tarjeta: Titular y código de cuenta copiable */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="min-w-0">
          <small
            className="text-xs font-semibold block"
            style={{ color: 'var(--muted)' }}
          >
            Titular de la cuenta
          </small>
          <b className="text-sm font-semibold truncate block mt-0.5">
            {cuenta?.titular || 'Cargando...'}
          </b>
        </div>

        <button
          type="button"
          onClick={copiarNumeroCuenta}
          className="ombria-chip h-8 px-3 text-xs inline-flex items-center gap-1.5 shrink-0"
          title="Copiar número de cuenta"
        >
          {copiado ? (
            <>
              <Check className="w-3.5 h-3.5" style={{ color: 'var(--good)' }} />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{cuenta?.numeroCuenta || '---'}</span>
            </>
          )}
        </button>
      </div>

    </section>
  );
}
