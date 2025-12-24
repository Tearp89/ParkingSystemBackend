const sequelize = require('../config/database');
const Tariff = require('./tariff.model')(sequelize);

const db = {
    sequelize,
    Tariff
};

module.exports = db;