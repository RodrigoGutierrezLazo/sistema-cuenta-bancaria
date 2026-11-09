const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cuenta_bancaria');
    console.log(`[MongoDB] Conectado exitosamente en: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Error al conectar a la base de datos: ${error.message}`);
    console.error('Asegúrate de que el servicio de MongoDB esté iniciado localmente o configura MONGODB_URI en el archivo .env');
    process.exit(1);
  }
};

module.exports = connectDB;
