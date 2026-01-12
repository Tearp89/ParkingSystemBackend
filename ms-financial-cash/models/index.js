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

db.Payment.belongsTo(db.CashCut, {
  foreignKey: 'cash_closing_id',
  as: 'CashClosing' // Este nombre debe coincidir con el 'as' del controlador
});

// Un corte de caja tiene muchos pagos
db.CashCut.hasMany(db.Payment, {
  foreignKey: 'cash_closing_id'
});

// Configurar relaciones (si las hubiera en el futuro)
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

module.exports = db;