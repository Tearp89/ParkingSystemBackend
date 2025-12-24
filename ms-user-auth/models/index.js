const sequelize = require('../config/database');
const User = require('./user.model')(sequelize);

const db = {
    sequelize,
    User
};

module.exports = db;