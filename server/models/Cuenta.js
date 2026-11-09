const mongoose = require('mongoose');

const cuentaSchema = new mongoose.Schema(
  {
    numeroCuenta: {
      type: String,
      required: [true, 'El número de cuenta es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    titular: {
      type: String,
      required: [true, 'El nombre del titular es obligatorio'],
      trim: true,
    },
    saldo: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'El saldo no puede ser negativo'],
    },
    tipoCuenta: {
      type: String,
      enum: ['Ahorros', 'Corriente', 'Sueldo'],
      default: 'Ahorros',
    },
    moneda: {
      type: String,
      default: 'PEN',
      trim: true,
    },
    estado: {
      type: String,
      enum: ['ACTIVA', 'BLOQUEADA'],
      default: 'ACTIVA',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Cuenta', cuentaSchema);
