const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const TicketModel = require('./ticket.model');
const PaymentModel = require('./payment.model');

const db = {
  Sequelize,
  sequelize,
  Ticket: TicketModel(sequelize),
  Payment: PaymentModel(sequelize)
};

module.exports = db;