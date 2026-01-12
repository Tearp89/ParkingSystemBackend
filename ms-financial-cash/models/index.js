
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');


const PaymentModel = require('./payment.model');
const CashCutModel = require('./cash-cut.model');

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
  as: 'CashClosing' 
});

db.CashCut.hasMany(db.Payment, {
  foreignKey: 'cash_closing_id'
});



module.exports = db;