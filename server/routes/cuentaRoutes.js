const express = require('express');
const router = express.Router();
const {
  obtenerCuentas,
  obtenerCuentaPorId,
  realizarDeposito,
  realizarRetiro,
  realizarTransferencia,
  obtenerHistorial,
} = require('../controllers/cuentaController');

// Rutas API REST estandarizadas
router.get('/cuentas', obtenerCuentas);
router.get('/cuenta/:id', obtenerCuentaPorId);
router.post('/cuenta/deposito', realizarDeposito);
router.post('/cuenta/retiro', realizarRetiro);
router.post('/cuenta/transferencia', realizarTransferencia);
router.get('/cuenta/:id/historial', obtenerHistorial);

module.exports = router;
