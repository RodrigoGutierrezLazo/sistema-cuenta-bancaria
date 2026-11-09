const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cuenta = require('../models/Cuenta');
const Transaccion = require('../models/Transaccion');

// Cargar variables de entorno
dotenv.config();

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cuenta_bancaria';
  
  try {
    console.log(`[Seed] Conectando a MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log('[Seed] Conexión establecida. Limpiando colecciones anteriores...');

    // Limpiar colecciones
    await Cuenta.deleteMany({});
    await Transaccion.deleteMany({});
    console.log('[Seed] Colecciones vaciadas con éxito.');

    // Cuentas de prueba iniciales
    const cuentasIniciales = [
      {
        numeroCuenta: 'CTA-1001',
        titular: 'Rodrigo Gutierrez Lazo',
        saldo: 3500.00,
        tipoCuenta: 'Ahorros',
        moneda: 'PEN',
        estado: 'ACTIVA',
      },
      {
        numeroCuenta: 'CTA-1002',
        titular: 'Maria Lopez Sanchez',
        saldo: 1200.00,
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
    ];

    const cuentasCreadas = await Cuenta.insertMany(cuentasIniciales);
    console.log(`[Seed] ${cuentasCreadas.length} cuentas bancarias registradas.`);

    // Transacciones iniciales de apertura
    const transaccionesIniciales = [
      {
        tipo: 'DEPOSITO',
        monto: 3500.00,
        descripcion: 'Depósito de apertura de cuenta',
        cuentaOrigen: null,
        cuentaDestino: 'CTA-1001',
        saldoPosterior: 3500.00,
        fecha: new Date(Date.now() - 3600 * 1000 * 24 * 3), // hace 3 días
      },
      {
        tipo: 'DEPOSITO',
        monto: 1200.00,
        descripcion: 'Depósito de apertura de cuenta',
        cuentaOrigen: null,
        cuentaDestino: 'CTA-1002',
        saldoPosterior: 1200.00,
        fecha: new Date(Date.now() - 3600 * 1000 * 24 * 2), // hace 2 días
      },
      {
        tipo: 'DEPOSITO',
        monto: 850.00,
        descripcion: 'Depósito de apertura de cuenta',
        cuentaOrigen: null,
        cuentaDestino: 'CTA-1003',
        saldoPosterior: 850.00,
        fecha: new Date(Date.now() - 3600 * 1000 * 24), // hace 1 día
      },
      {
        tipo: 'TRANSFERENCIA',
        monto: 250.00,
        descripcion: 'Transferencia de prueba entre cuentas',
        cuentaOrigen: 'CTA-1001',
        cuentaDestino: 'CTA-1002',
        saldoPosterior: 3250.00,
        fecha: new Date(Date.now() - 3600 * 1000 * 5), // hace 5 horas
      },
    ];

    // Ajustar el saldo de CTA-1001 y CTA-1002 para reflejar la transferencia de prueba
    await Cuenta.updateOne({ numeroCuenta: 'CTA-1001' }, { saldo: 3250.00 });
    await Cuenta.updateOne({ numeroCuenta: 'CTA-1002' }, { saldo: 1450.00 });

    await Transaccion.insertMany(transaccionesIniciales);
    console.log(`[Seed] ${transaccionesIniciales.length} transacciones de historial inicial registradas.`);

    console.log('\n=============================================================');
    console.log('✅ BASE DE DATOS INICIALIZADA SATISFACTORIAMENTE');
    console.log('=============================================================');
    console.table(
      cuentasCreadas.map((c) => ({
        'Número Cuenta': c.numeroCuenta,
        'Titular': c.titular,
        'Saldo': `S/ ${c.saldo.toFixed(2)}`,
        'Tipo': c.tipoCuenta,
      }))
    );
    console.log('=============================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Error durante la inicialización:', error);
    process.exit(1);
  }
};

seedDatabase();
