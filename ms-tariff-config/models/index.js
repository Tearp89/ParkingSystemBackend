const { Sequelize } = require('sequelize'); 
const sequelize = require('../config/database'); 
const Tariff = require('./tariff.model')(sequelize);

const db = {
    Sequelize, 
    sequelize,
    Tariff
};

module.exports = db;