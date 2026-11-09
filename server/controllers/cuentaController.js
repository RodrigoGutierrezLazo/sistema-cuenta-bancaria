const mongoose = require('mongoose');
const Cuenta = require('../models/Cuenta');
const Transaccion = require('../models/Transaccion');

// Función auxiliar para buscar cuenta por MongoDB _id o por numeroCuenta
const buscarCuenta = async (identificador) => {
  if (!identificador) return null;
  const strId = identificador.toString().trim();
  
  if (mongoose.Types.ObjectId.isValid(strId) && strId.length === 24) {
    const cuentaPorId = await Cuenta.findById(strId);
    if (cuentaPorId) return cuentaPorId;
  }
  
  return await Cuenta.findOne({ numeroCuenta: strId.toUpperCase() });
};

// GET /api/cuentas
// Obtener lista de todas las cuentas bancarias
const obtenerCuentas = async (req, res) => {
  try {
    const cuentas = await Cuenta.find().sort({ numeroCuenta: 1 });
    return res.status(200).json(cuentas);
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    return res.status(500).json({ error: 'Error interno del servidor al listar cuentas' });
  }
};

// GET /api/cuenta/:id
// Obtiene saldo y datos de la cuenta
const obtenerCuentaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await buscarCuenta(id);

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
    }

    return res.status(200).json(cuenta);
  } catch (error) {
    console.error('Error al consultar cuenta:', error);
    return res.status(500).json({ error: 'Error interno del servidor al consultar saldo' });
  }
};

// POST /api/cuenta/deposito
// Registra un depósito y actualiza el saldo de la cuenta
const realizarDeposito = async (req, res) => {
  try {
    const { id, numeroCuenta, monto, descripcion } = req.body;
    const identificador = numeroCuenta || id;

    if (!identificador) {
      return res.status(400).json({ error: 'Debe especificar el número de cuenta o identificador' });
    }

    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      return res.status(400).json({ error: 'El monto a depositar debe ser un número válido mayor a 0' });
    }

    const cuenta = await buscarCuenta(identificador);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
    }

    if (cuenta.estado === 'BLOQUEADA') {
      return res.status(400).json({ error: 'La cuenta se encuentra bloqueada para transacciones' });
    }

    // Actualizar saldo
    cuenta.saldo = Number((cuenta.saldo + numMonto).toFixed(2));
    await cuenta.save();

    // Persistir transacción
    const transaccion = await Transaccion.create({
      tipo: 'DEPOSITO',
      monto: numMonto,
      descripcion: descripcion && descripcion.trim() !== '' ? descripcion.trim() : 'Depósito en efectivo/ventanilla',
      cuentaOrigen: null,
      cuentaDestino: cuenta.numeroCuenta,
      saldoPosterior: cuenta.saldo,
      fecha: new Date(),
    });

    return res.status(200).json({
      mensaje: 'Depósito realizado con éxito',
      cuenta,
      transaccion,
    });
  } catch (error) {
    console.error('Error al procesar depósito:', error);
    return res.status(500).json({ error: 'Error interno del servidor al procesar el depósito' });
  }
};

// POST /api/cuenta/retiro
// Registra un retiro validando suficiencia de fondos
const realizarRetiro = async (req, res) => {
  try {
    const { id, numeroCuenta, monto, descripcion } = req.body;
    const identificador = numeroCuenta || id;

    if (!identificador) {
      return res.status(400).json({ error: 'Debe especificar el número de cuenta o identificador' });
    }

    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      return res.status(400).json({ error: 'El monto a retirar debe ser un número mayor a 0' });
    }

    const cuenta = await buscarCuenta(identificador);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
    }

    if (cuenta.estado === 'BLOQUEADA') {
      return res.status(400).json({ error: 'La cuenta se encuentra bloqueada' });
    }

    if (cuenta.saldo < numMonto) {
      return res.status(400).json({
        error: `Saldo insuficiente. Saldo disponible: S/ ${cuenta.saldo.toFixed(2)}, monto solicitado: S/ ${numMonto.toFixed(2)}`,
      });
    }

    // Actualizar saldo evitando negativos
    cuenta.saldo = Number((cuenta.saldo - numMonto).toFixed(2));
    await cuenta.save();

    // Persistir registro de transacción
    const transaccion = await Transaccion.create({
      tipo: 'RETIRO',
      monto: numMonto,
      descripcion: descripcion && descripcion.trim() !== '' ? descripcion.trim() : 'Retiro por cajero / ventanilla',
      cuentaOrigen: cuenta.numeroCuenta,
      cuentaDestino: null,
      saldoPosterior: cuenta.saldo,
      fecha: new Date(),
    });

    return res.status(200).json({
      mensaje: 'Retiro procesado exitosamente',
      cuenta,
      transaccion,
    });
  } catch (error) {
    console.error('Error al procesar retiro:', error);
    return res.status(500).json({ error: 'Error interno del servidor al procesar el retiro' });
  }
};

// POST /api/cuenta/transferencia
// Registra transferencia entre cuentas con validación de existencia y saldo
const realizarTransferencia = async (req, res) => {
  try {
    const { cuentaOrigen, cuentaDestino, monto, descripcion } = req.body;

    if (!cuentaOrigen || !cuentaDestino) {
      return res.status(400).json({ error: 'Debe proporcionar la cuenta de origen y la cuenta de destino' });
    }

    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      return res.status(400).json({ error: 'El monto a transferir debe ser mayor a 0' });
    }

    const origen = await buscarCuenta(cuentaOrigen);
    if (!origen) {
      return res.status(404).json({ error: 'La cuenta de origen no existe' });
    }

    const destino = await buscarCuenta(cuentaDestino);
    if (!destino) {
      return res.status(404).json({ error: 'La cuenta de destino no existe' });
    }

    if (origen.numeroCuenta === destino.numeroCuenta) {
      return res.status(400).json({ error: 'No se puede transferir dinero hacia la misma cuenta de origen' });
    }

    if (origen.estado === 'BLOQUEADA' || destino.estado === 'BLOQUEADA') {
      return res.status(400).json({ error: 'Una de las cuentas involucradas está inactiva o bloqueada' });
    }

    if (origen.saldo < numMonto) {
      return res.status(400).json({
        error: `Saldo insuficiente para transferir. Disponible: S/ ${origen.saldo.toFixed(2)}, Requerido: S/ ${numMonto.toFixed(2)}`,
      });
    }

    // Actualización atómica de saldos
    origen.saldo = Number((origen.saldo - numMonto).toFixed(2));
    destino.saldo = Number((destino.saldo + numMonto).toFixed(2));

    await origen.save();
    await destino.save();

    // Crear registro de transacción
    const transaccion = await Transaccion.create({
      tipo: 'TRANSFERENCIA',
      monto: numMonto,
      descripcion: descripcion && descripcion.trim() !== '' 
        ? descripcion.trim() 
        : `Transferencia de ${origen.numeroCuenta} a ${destino.numeroCuenta}`,
      cuentaOrigen: origen.numeroCuenta,
      cuentaDestino: destino.numeroCuenta,
      saldoPosterior: origen.saldo,
      fecha: new Date(),
    });

    return res.status(200).json({
      mensaje: 'Transferencia realizada con éxito',
      cuenta: origen,
      cuentaDestino: {
        numeroCuenta: destino.numeroCuenta,
        titular: destino.titular,
      },
      transaccion,
    });
  } catch (error) {
    console.error('Error al procesar transferencia:', error);
    return res.status(500).json({ error: 'Error interno del servidor al procesar la transferencia' });
  }
};

// GET /api/cuenta/:id/historial
// Obtiene el registro de transacciones de la cuenta
const obtenerHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await buscarCuenta(id);

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
    }

    // Buscar transacciones donde sea origen o destino
    const transacciones = await Transaccion.find({
      $or: [
        { cuentaOrigen: cuenta.numeroCuenta },
        { cuentaDestino: cuenta.numeroCuenta },
      ],
    }).sort({ fecha: -1, createdAt: -1 });

    return res.status(200).json({
      numeroCuenta: cuenta.numeroCuenta,
      titular: cuenta.titular,
      total: transacciones.length,
      transacciones,
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return res.status(500).json({ error: 'Error interno del servidor al obtener historial' });
  }
};

module.exports = {
  obtenerCuentas,
  obtenerCuentaPorId,
  realizarDeposito,
  realizarRetiro,
  realizarTransferencia,
  obtenerHistorial,
};
