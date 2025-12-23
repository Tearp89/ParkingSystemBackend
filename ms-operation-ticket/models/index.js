const { Sequelize } = require('sequelize'); // <--- Faltaba esta línea
const sequelize = require('../config/database');
const TicketModel = require('./ticket.model');

const db = {
  Sequelize, // Ahora sí, Sequelize está definido
  sequelize,
  Ticket: TicketModel(sequelize)
};

module.exports = db;