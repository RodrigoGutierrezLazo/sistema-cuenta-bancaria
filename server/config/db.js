const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const defaultUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cuenta_bancaria';

  try {
    // Intentar conectar al servicio local de MongoDB primero con timeout de 2.5s
    const conn = await mongoose.connect(defaultUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB Local] Conectado exitosamente en: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.log(`[MongoDB] No se detectó un servicio activo en ${defaultUri}.`);
    console.log(`[MongoDB] Levantando instancia embebida de MongoDB para ejecución inmediata y autónoma...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB Embebido] Conectado exitosamente a la base de datos en memoria.`);

      // Poblar automáticamente cuentas de prueba si está vacía
      await autoSeedSiEsNecesario();

      return conn;
    } catch (memError) {
      console.error(`[MongoDB Error Crítico] No se pudo inicializar la base de datos:`, memError.message);
      process.exit(1);
    }
  }
};

// Función para asegurar datos iniciales si se usa base en memoria o BD vacía
const autoSeedSiEsNecesario = async () => {
  try {
    const Cuenta = require('../models/Cuenta');
    const Transaccion = require('../models/Transaccion');

    const totalCuentas = await Cuenta.countDocuments();
    if (totalCuentas === 0) {
      console.log('[Auto-Seed] Inicializando cuentas y transacciones de prueba...');

      const cuentas = await Cuenta.insertMany([
        {
          numeroCuenta: 'CTA-1001',
          titular: 'Rodrigo Gutierrez Lazo',
          saldo: 3250.00,
          tipoCuenta: 'Ahorros',
          moneda: 'PEN',
          estado: 'ACTIVA',
        },
        {
          numeroCuenta: 'CTA-1002',
          titular: 'Maria Lopez Sanchez',
          saldo: 1450.00,
          tipoCuenta: 'Corriente',
          moneda: 'PEN',
          estado: 'ACTIVA',
        },
        {
          numeroCuenta: 'CTA-1003',
          titular: 'Carlos Perez Gomez',
          saldo: 850.00,
          tipoCuenta: 'Ahorros',
          moneda: 'PEN',
          estado: 'ACTIVA',
        },
      ]);

      await Transaccion.insertMany([
        {
          tipo: 'DEPOSITO',
          monto: 3500.00,
          descripcion: 'Depósito de apertura de cuenta',
          cuentaOrigen: null,
          cuentaDestino: 'CTA-1001',
          saldoPosterior: 3500.00,
          fecha: new Date(Date.now() - 3600 * 1000 * 24 * 3),
        },
        {
          tipo: 'DEPOSITO',
          monto: 1200.00,
          descripcion: 'Depósito de apertura de cuenta',
          cuentaOrigen: null,
          cuentaDestino: 'CTA-1002',
          saldoPosterior: 1200.00,
          fecha: new Date(Date.now() - 3600 * 1000 * 24 * 2),
        },
        {
          tipo: 'DEPOSITO',
          monto: 850.00,
          descripcion: 'Depósito de apertura de cuenta',
          cuentaOrigen: null,
          cuentaDestino: 'CTA-1003',
          saldoPosterior: 850.00,
          fecha: new Date(Date.now() - 3600 * 1000 * 24),
        },
        {
          tipo: 'TRANSFERENCIA',
          monto: 250.00,
          descripcion: 'Transferencia de prueba entre cuentas',
          cuentaOrigen: 'CTA-1001',
          cuentaDestino: 'CTA-1002',
          saldoPosterior: 3250.00,
          fecha: new Date(Date.now() - 3600 * 1000 * 5),
        },
      ]);

      console.log(`[Auto-Seed] ${cuentas.length} cuentas de prueba cargadas correctamente.`);
    }
  } catch (err) {
    console.error('[Auto-Seed Error]', err.message);
  }
};

module.exports = connectDB;
