const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Función genérica para realizar peticiones HTTP con manejo estandarizado de errores
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.error || data.mensaje || `Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor backend (Node.js/Express en puerto 5000). Verifique que esté encendido.');
    }
    throw error;
  }
};

export const api = {
  // Obtener todas las cuentas registradas
  obtenerCuentas: () => request('/cuentas'),

  // Obtener datos y saldo de una cuenta específica
  obtenerCuenta: (id) => request(`/cuenta/${encodeURIComponent(id)}`),

  // Realizar un depósito
  realizarDeposito: ({ numeroCuenta, monto, descripcion }) =>
    request('/cuenta/deposito', {
      method: 'POST',
      body: JSON.stringify({ numeroCuenta, monto, descripcion }),
    }),

  // Realizar un retiro
  realizarRetiro: ({ numeroCuenta, monto, descripcion }) =>
    request('/cuenta/retiro', {
      method: 'POST',
      body: JSON.stringify({ numeroCuenta, monto, descripcion }),
    }),

  // Realizar una transferencia entre cuentas
  realizarTransferencia: ({ cuentaOrigen, cuentaDestino, monto, descripcion }) =>
    request('/cuenta/transferencia', {
      method: 'POST',
      body: JSON.stringify({ cuentaOrigen, cuentaDestino, monto, descripcion }),
    }),

  // Obtener historial de transacciones de una cuenta
  obtenerHistorial: (id) => request(`/cuenta/${encodeURIComponent(id)}/historial`),
};

export default api;
