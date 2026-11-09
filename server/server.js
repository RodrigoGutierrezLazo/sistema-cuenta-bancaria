const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cuentaRoutes = require('./routes/cuentaRoutes');

// Cargar variables de entorno
dotenv.config();

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB local
connectDB();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ruta base informativa
app.get('/', (req, res) => {
  res.json({
    nombre: 'API de Gestión de Cuenta Bancaria',
    autor: 'Rodrigo Gutierrez Lazo',
    asignatura: 'Ingeniería Web',
    version: '1.0.0',
    endpoints: {
      cuentas: 'GET /api/cuentas',
      cuenta: 'GET /api/cuenta/:id',
      deposito: 'POST /api/cuenta/deposito',
      retiro: 'POST /api/cuenta/retiro',
      transferencia: 'POST /api/cuenta/transferencia',
      historial: 'GET /api/cuenta/:id/historial',
    },
  });
});

// Registrar rutas de la API
app.use('/api', cuentaRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en la API' });
});

// Manejo global de errores (500)
app.use((err, req, res, next) => {
  console.error('[Error no controlado]:', err);
  res.status(500).json({
    error: 'Ocurrió un error inesperado en el servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Servidor bancario escuchando en http://localhost:${PORT}`);
  console.log(`Endpoints disponibles en http://localhost:${PORT}/api`);
  console.log(`Desarrollado por: Rodrigo Gutierrez Lazo`);
  console.log(`====================================================`);
});
