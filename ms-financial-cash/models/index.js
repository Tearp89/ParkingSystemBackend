// ms-financial-cash/models/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Importar definiciones de modelos
const PaymentModel = require('./payment.model');
const CashCutModel = require('./cash-cut.model');

// Inicializar modelos
const Payment = PaymentModel(sequelize);
const CashCut = CashCutModel(sequelize);

const db = {
  Sequelize,
  sequelize,
  Payment,
  CashCut
};

// Configurar relaciones (si las hubiera en el futuro)
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

module.exports = db;