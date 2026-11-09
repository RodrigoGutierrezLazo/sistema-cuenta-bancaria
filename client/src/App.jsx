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

  // Cargar lista general de cuentas registradas
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
      setErrorGlobal(err.message || 'Error de conexión con el backend');
      return null;
    }
  }, [cuentaActiva?.numeroCuenta]);

  // Cargar saldo e historial de la cuenta activa
  const sincronizarCuentaActiva = useCallback(async (numeroCuenta) => {
    if (!numeroCuenta) return;
    setCargando(true);
    try {
      // Peticiones paralelas para mayor rendimiento
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

  // Inicialización al montar el componente
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

  // Manejar cambio manual de cuenta en el Navbar
  const handleSeleccionarCuenta = async (numeroCuenta) => {
    const seleccionada = cuentas.find((c) => c.numeroCuenta === numeroCuenta);
    if (seleccionada) {
      setCuentaActiva(seleccionada);
      await sincronizarCuentaActiva(numeroCuenta);
    }
  };

  // Enviar y procesar operaciones (Depósito, Retiro, Transferencia)
  const handleOperacion = async ({ tipo, monto, cuentaOrigen, cuentaDestino, numeroCuenta, descripcion }) => {
    setProcesando(true);
    try {
      let respuesta;
      if (tipo === 'deposito') {
        respuesta = await api.realizarDeposito({ numeroCuenta, monto, descripcion });
        setNotificacion({
          mensaje: `Depósito de S/ ${monto.toFixed(2)} efectuado con éxito en ${numeroCuenta}`,
          tipo: 'exito',
        });
      } else if (tipo === 'retiro') {
        respuesta = await api.realizarRetiro({ numeroCuenta, monto, descripcion });
        setNotificacion({
          mensaje: `Retiro de S/ ${monto.toFixed(2)} procesado correctamente`,
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
          mensaje: `Transferencia de S/ ${monto.toFixed(2)} enviada con éxito a ${cuentaDestino}`,
          tipo: 'exito',
        });
      }

      // Sincronización instantánea de estado (Requerimiento Funcional 1, 2, 3, 4 y 5)
      await cargarCuentas(cuentaActiva?.numeroCuenta);
      await sincronizarCuentaActiva(cuentaActiva?.numeroCuenta);
      return respuesta;
    } catch (error) {
      setNotificacion({
        mensaje: error.message || 'Ocurrió un error al procesar la transacción',
        tipo: 'error',
      });
      throw error;
    } finally {
      setProcesando(false);
    }
  };

  // Cuentas disponibles para transferencia (excluyendo la activa)
  const otrasCuentas = cuentas.filter(
    (c) => c.numeroCuenta !== cuentaActiva?.numeroCuenta
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Barra de Navegación */}
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

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Banner de error global si el backend no responde */}
        {errorGlobal && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Error de sincronización con el servidor</h4>
                <p className="text-xs text-rose-700 mt-0.5">{errorGlobal}</p>
                <p className="text-[11px] text-rose-600 mt-1">
                  Verifica que el backend esté ejecutándose con <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">npm run dev</code> en la carpeta <strong>/server</strong> y que MongoDB esté activo.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                cargarCuentas();
                sincronizarCuentaActiva(cuentaActiva?.numeroCuenta);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Saldo y Operaciones (5 columnas en pantallas grandes) */}
          <div className="lg:col-span-5 space-y-8">
            <SaldoCard cuenta={cuentaActiva} cargando={cargando} />
            <FormOperacion
              cuentaActiva={cuentaActiva}
              otrasCuentas={otrasCuentas}
              onSubmitOperacion={handleOperacion}
              procesando={procesando}
            />
          </div>

          {/* Columna Derecha: Historial de Transacciones (7 columnas en pantallas grandes) */}
          <div className="lg:col-span-7">
            <HistorialTransacciones
              transacciones={transacciones}
              cuentaActiva={cuentaActiva}
              cargando={cargando}
            />
          </div>

        </div>

      </main>

      {/* Notificación Toast flotante */}
      <AlertNotification
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
        onClose={() => setNotificacion({ mensaje: '', tipo: 'exito' })}
      />

      {/* Pie de Página Institucional */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700">
              Trabajo Práctico: Sistema de Gestión de Cuenta Bancaria Simplificada
            </p>
            <p className="text-[11px] text-slate-400">
              Asignatura: Ingeniería Web | Unidad de Desarrollo Full-Stack (Node.js + React + MongoDB)
            </p>
          </div>
          <div className="text-slate-600">
            <p>
              Desarrollado por: <strong className="text-purple-700">Rodrigo Gutierrez Lazo</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Departamento de Ingeniería de Sistemas y Computación
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
