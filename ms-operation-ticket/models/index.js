const { Sequelize } = require('sequelize'); 
const sequelize = require('../config/database');
const TicketModel = require('./ticket.model');

const db = {
  Sequelize, 
  sequelize,
  Ticket: TicketModel(sequelize)
};

module.exports = db;