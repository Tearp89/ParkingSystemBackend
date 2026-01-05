const { Sequelize } = require('sequelize'); // Importamos la clase
const sequelize = require('../config/database'); // Importamos la instancia
const Tariff = require('./tariff.model')(sequelize);

const db = {
    Sequelize, // Agregamos la clase aquí
    sequelize,
    Tariff
};

module.exports = db;