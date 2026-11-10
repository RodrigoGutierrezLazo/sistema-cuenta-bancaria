import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SaldoCard from './components/SaldoCard';
import FormOperacion from './components/FormOperacion';
import HistorialTransacciones from './components/HistorialTransacciones';
import AlertNotification from './components/AlertNotification';
import { api } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [cuentas, setCuentas] = useState([]);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');
  const [notificacion, setNotificacion] = useState({ mensaje: '', tipo: 'exito' });

  const cargarCuentas = useCallback(async (mantenerNumeroCuenta = null) => {
    try {
      setErrorGlobal('');
      const lista = await api.obtenerCuentas();
      setCuentas(lista);

      if (lista && lista.length > 0) {
        const idBuscado = mantenerNumeroCuenta || cuentaActiva?.numeroCuenta || lista[0].numeroCuenta;
        const encontrada = lista.find((c) => c.numeroCuenta === idBuscado) || lista[0];
        setCuentaActiva(encontrada);
        return encontrada;
      }
      return null;
    } catch (err) {
      console.error('Error al cargar cuentas:', err);
      setErrorGlobal(err.message || 'Error de conexión con el servidor backend');
      return null;
    }
  }, [cuentaActiva?.numeroCuenta]);

  const sincronizarCuentaActiva = useCallback(async (numeroCuenta) => {
    if (!numeroCuenta) return;
    setCargando(true);
    try {
      const [datosCuenta, datosHistorial] = await Promise.all([
        api.obtenerCuenta(numeroCuenta),
        api.obtenerHistorial(numeroCuenta),
      ]);

      setCuentaActiva(datosCuenta);
      setTransacciones(datosHistorial.transacciones || []);
      setErrorGlobal('');
    } catch (err) {
      console.error('Error al sincronizar cuenta activa:', err);
      setErrorGlobal(err.message || 'No se pudieron sincronizar los datos de la cuenta');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setCargando(true);
      const primeraCuenta = await cargarCuentas();
      if (primeraCuenta) {
        await sincronizarCuentaActiva(primeraCuenta.numeroCuenta);
      }
      setCargando(false);
    };
    init();
  }, []);

  const handleSeleccionarCuenta = async (numeroCuenta) => {
    const seleccionada = cuentas.find((c) => c.numeroCuenta === numeroCuenta);
    if (seleccionada) {
      setCuentaActiva(seleccionada);
      await sincronizarCuentaActiva(numeroCuenta);
    }
  };

  const handleOperacion = async ({ tipo, monto, cuentaOrigen, cuentaDestino, numeroCuenta, descripcion }) => {
    setProcesando(true);
    try {
      let respuesta;
      if (tipo === 'deposito') {
        respuesta = await api.realizarDeposito({ numeroCuenta, monto, descripcion });
        setNotificacion({
          mensaje: `Abono de S/ ${monto.toFixed(2)} registrado en la cuenta ${numeroCuenta}.`,
          tipo: 'exito',
        });
      } else if (tipo === 'retiro') {
        respuesta = await api.realizarRetiro({ numeroCuenta, monto, descripcion });
        setNotificacion({
          mensaje: `Cargo por retiro de S/ ${monto.toFixed(2)} procesado en ${numeroCuenta}.`,
          tipo: 'exito',
        });
      } else if (tipo === 'transferencia') {
        respuesta = await api.realizarTransferencia({
          cuentaOrigen,
          cuentaDestino,
          monto,
          descripcion,
        });
        setNotificacion({
          mensaje: `Transferencia de S/ ${monto.toFixed(2)} enviada a la cuenta ${cuentaDestino}.`,
          tipo: 'exito',
        });
      }

      await cargarCuentas(cuentaActiva?.numeroCuenta);
      await sincronizarCuentaActiva(cuentaActiva?.numeroCuenta);
      return respuesta;
    } catch (error) {
      setNotificacion({
        mensaje: error.message || 'No se pudo procesar la transacción solicitada.',
        tipo: 'error',
      });
      throw error;
    } finally {
      setProcesando(false);
    }
  };

  const otrasCuentas = cuentas.filter(
    (c) => c.numeroCuenta !== cuentaActiva?.numeroCuenta
  );

  // Cálculo de resumen de ingresos y cargos de la cuenta activa
  const resumenCuenta = transacciones.reduce(
    (acc, t) => {
      const esDeposito = t.tipo === 'DEPOSITO';
      const esTransfRecibida = t.tipo === 'TRANSFERENCIA' && t.cuentaDestino === cuentaActiva?.numeroCuenta;
      if (esDeposito || esTransfRecibida) {
        acc.ingresos += Number(t.monto || 0);
      } else {
        acc.egresos += Number(t.monto || 0);
      }
      return acc;
    },
    { ingresos: 0, egresos: 0 }
  );

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col font-sans text-[#14181F]">
      
      <Navbar
        cuentas={cuentas}
        cuentaActiva={cuentaActiva}
        onSeleccionarCuenta={handleSeleccionarCuenta}
        cargando={cargando}
        onRecargar={() => {
          cargarCuentas();
          sincronizarCuentaActiva(cuentaActiva?.numeroCuenta);
        }}
      />

      {/* Encabezado contextual de página */}
      <div className="bg-white border-b border-[#DEDCD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Operaciones Bancarias
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-[#0B192C] tracking-tight">
              Posición consolidada y registro de transacciones
            </h1>
          </div>

          <div className="flex items-center gap-6 text-xs border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#EAE8E1]">
            <div>
              <span className="block text-[11px] text-slate-500">Abonos acumulados</span>
              <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                + S/ {resumenCuenta.ingresos.toFixed(2)}
              </span>
            </div>
            <div className="h-7 w-px bg-[#DEDCD3]"></div>
            <div>
              <span className="block text-[11px] text-slate-500">Cargos acumulados</span>
              <span className="font-mono font-semibold text-rose-700 tabular-nums">
                - S/ {resumenCuenta.egresos.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Área de trabajo principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {errorGlobal && (
          <div className="mb-6 p-4 rounded bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Error de comunicación con el servidor</p>
                <p className="text-rose-800 mt-0.5">{errorGlobal}</p>
              </div>
            </div>
            <button
              onClick={() => {
                cargarCuentas();
                sincronizarCuentaActiva(cuentaActiva?.numeroCuenta);
              }}
              className="px-2.5 py-1 rounded bg-rose-800 hover:bg-rose-900 text-white text-xs font-medium flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Reintentar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Columna de Posición y Formulario (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            <SaldoCard cuenta={cuentaActiva} cargando={cargando} />
            <FormOperacion
              cuentaActiva={cuentaActiva}
              otrasCuentas={otrasCuentas}
              onSubmitOperacion={handleOperacion}
              procesando={procesando}
            />
          </div>

          {/* Columna de Estado de Cuenta / Historial (7/12) */}
          <div className="lg:col-span-7">
            <HistorialTransacciones
              transacciones={transacciones}
              cuentaActiva={cuentaActiva}
              cargando={cargando}
            />
          </div>

        </div>

      </main>

      <AlertNotification
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
        onClose={() => setNotificacion({ mensaje: '', tipo: 'exito' })}
      />

      {/* Pie de página sobrio */}
      <footer className="bg-white border-t border-[#DEDCD3] py-4 mt-10 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-slate-600">
            Sistema de Gestión de Cuenta Bancaria • <span className="text-slate-500">Ingeniería Web</span>
          </p>
          <p className="text-slate-600">
            Desarrollado por <strong className="font-semibold text-[#0B192C]">Rodrigo Gutierrez Lazo</strong>
          </p>
        </div>
      </footer>

    </div>
  );
}
