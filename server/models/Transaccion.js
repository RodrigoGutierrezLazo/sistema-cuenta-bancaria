const mongoose = require('mongoose');

const transaccionSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: [true, 'El tipo de transacción es obligatorio'],
      enum: {
        values: ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'],
        message: 'Tipo de operación no válido',
      },
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0.01, 'El monto a operar debe ser mayor a cero'],
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    cuentaOrigen: {
      type: String,
      trim: true,
      default: null,
    },
    cuentaDestino: {
      type: String,
      trim: true,
      default: null,
    },
    saldoPosterior: {
      type: Number,
      default: null,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Transaccion', transaccionSchema);
