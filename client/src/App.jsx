import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SaldoCard from './components/SaldoCard';
import FormOperacion from './components/FormOperacion';
import HistorialTransacciones from './components/HistorialTransacciones';
import AlertNotification from './components/AlertNotification';
import { api } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Componente principal App:
 * Gestiona el estado reactivo de la cuenta activa, el historial y las operaciones.
 */
export default function App() {
  const [cuentas, setCuentas] = useState([]);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');
  const [notificacion, setNotificacion] = useState({ mensaje: '', tipo: 'exito' });
  const [tema, setTema] = useState(() => localStorage.getItem('ombria-tema') || 'dark');

  // Aplicar tema claro u oscuro en el elemento raíz (html[data-theme])
  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    localStorage.setItem('ombria-tema', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Obtener todas las cuentas bancarias desde la API
  const cargarCuentas = useCallback(async (mantenerNumero = null) => {
    try {
      setErrorGlobal('');
      const lista = await api.obtenerCuentas();
      setCuentas(lista);

      if (lista && lista.length > 0) {
        const codigoBuscado = mantenerNumero || cuentaActiva?.numeroCuenta || lista[0].numeroCuenta;
        const encontrada = lista.find((c) => c.numeroCuenta === codigoBuscado) || lista[0];
        setCuentaActiva(encontrada);
        return encontrada;
      }
      return null;
    } catch (err) {
      setErrorGlobal(err.message || 'No se pudo conectar con el servidor backend.');
      return null;
    }
  }, [cuentaActiva?.numeroCuenta]);

  // Sincronizar saldo e historial de la cuenta seleccionada
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
      setErrorGlobal(err.message || 'Error al sincronizar los datos de la cuenta.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial al montar la aplicación
  useEffect(() => {
    const inicializar = async () => {
      setCargando(true);
      const primeraCuenta = await cargarCuentas();
      if (primeraCuenta) {
        await sincronizarCuentaActiva(primeraCuenta.numeroCuenta);
      }
      setCargando(false);
    };
    inicializar();
  }, []);

  // Cambiar de cuenta activa desde el selector del Navbar
  const manejarCambioCuenta = async (numeroCuenta) => {
    const seleccionada = cuentas.find((c) => c.numeroCuenta === numeroCuenta);
    if (seleccionada) {
      setCuentaActiva(seleccionada);
      await sincronizarCuentaActiva(numeroCuenta);
    }
  };

  // Procesar Depósito, Retiro o Transferencia y actualizar estado sin recargar página
  const manejarOperacion = async ({ tipo, monto, cuentaOrigen, cuentaDestino, numeroCuenta, descripcion }) => {
    setProcesando(true);
    try {
      if (tipo === 'deposito') {
        await api.realizarDeposito({ numeroCuenta, monto, descripcion });
        setNotificacion({
          mensaje: `Depósito de S/ ${monto.toFixed(2)} registrado en ${numeroCuenta}.`,
          tipo: 'exito',
        });
      } else if (tipo === 'retiro') {
        await api.realizarRetiro({ numeroCuenta, monto, descripcion });
        setNotificacion({
          mensaje: `Retiro de S/ ${monto.toFixed(2)} procesado en ${numeroCuenta}.`,
          tipo: 'exito',
        });
      } else if (tipo === 'transferencia') {
        await api.realizarTransferencia({ cuentaOrigen, cuentaDestino, monto, descripcion });
        setNotificacion({
          mensaje: `Transferencia de S/ ${monto.toFixed(2)} enviada a ${cuentaDestino}.`,
          tipo: 'exito',
        });
      }

      // Actualizar inmediatamente saldo y movimientos en la interfaz
      await cargarCuentas(cuentaActiva?.numeroCuenta);
      await sincronizarCuentaActiva(cuentaActiva?.numeroCuenta);
    } catch (error) {
      setNotificacion({
        mensaje: error.message || 'Error al ejecutar la operación bancaria.',
        tipo: 'error',
      });
      throw error;
    } finally {
      setProcesando(false);
    }
  };

  // Filtrar cuentas destinatarias (todas menos la activa)
  const otrasCuentas = cuentas.filter((c) => c.numeroCuenta !== cuentaActiva?.numeroCuenta);

  // Calcular totales rápidos de abonos y retiros de la cuenta activa
  const totales = transacciones.reduce(
    (acc, t) => {
      const esIngreso =
        t.tipo === 'DEPOSITO' ||
        (t.tipo === 'TRANSFERENCIA' && t.cuentaDestino === cuentaActiva?.numeroCuenta);
      if (esIngreso) acc.ingresos += Number(t.monto || 0);
      else acc.egresos += Number(t.monto || 0);
      return acc;
    },
    { ingresos: 0, egresos: 0 }
  );

  return (
    <div className="min-h-dvh pb-10">
      
      {/* Barra superior flotante */}
      <Navbar
        cuentas={cuentas}
        cuentaActiva={cuentaActiva}
        onSeleccionarCuenta={manejarCambioCuenta}
        cargando={cargando}
        onRecargar={() => {
          cargarCuentas();
          sincronizarCuentaActiva(cuentaActiva?.numeroCuenta);
        }}
        tema={tema}
        onCambiarTema={alternarTema}
      />

      {/* Contenedor principal estilo panel Ombria (.main) */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 mt-7">
        <main className="ombria-main p-5 sm:p-7">
          
          {/* Encabezado de página estilo Ombria (.phead) */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                Panel financiero · {cuentaActiva?.numeroCuenta || 'Cargando'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                Hola, {cuentaActiva?.titular?.split(' ')[0] || 'Usuario'}
              </h1>
            </div>

            {/* Indicadores resumidos en píldoras */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="ombria-pill ombria-pill--good">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Ingresos: + S/ {totales.ingresos.toFixed(2)}
              </span>
              <span className="ombria-pill ombria-pill--bad">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Egresos: - S/ {totales.egresos.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Alerta de conexión si el servidor backend está apagado */}
          {errorGlobal && (
            <div
              className="mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold"
              style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorGlobal}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  cargarCuentas();
                  sincronizarCuentaActiva(cuentaActiva?.numeroCuenta);
                }}
                className="ombria-chip h-8 px-3 text-xs inline-flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reintentar
              </button>
            </div>
          )}

          {/* Cuadrícula principal: Saldo + Formulario a la izquierda, Historial a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
            
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <SaldoCard cuenta={cuentaActiva} cargando={cargando} />
              <FormOperacion
                cuentaActiva={cuentaActiva}
                otrasCuentas={otrasCuentas}
                onSubmitOperacion={manejarOperacion}
                procesando={procesando}
              />
            </div>

            <div className="lg:col-span-7">
              <HistorialTransacciones
                transacciones={transacciones}
                cuentaActiva={cuentaActiva}
                cargando={cargando}
              />
            </div>

          </div>

          {/* Pie de página integrado dentro del contenedor principal */}
          <footer
            className="mt-8 pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium"
            style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
          >
            <span>
              Trabajo Práctico: Sistema de Gestión de Cuenta Bancaria Simplificada · Ingeniería Web
            </span>
            <span>
              Desarrollado por <b style={{ color: 'var(--ink)' }}>Rodrigo Gutierrez Lazo</b>
            </span>
          </footer>

        </main>
      </div>

      {/* Notificación flotante tipo toast */}
      <AlertNotification
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
        onClose={() => setNotificacion({ mensaje: '', tipo: 'exito' })}
      />

    </div>
  );
}
