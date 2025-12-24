// ms-financial-cash/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'parking_master',
  process.env.DB_USER || 'user_dev',
  process.env.DB_PASS || 'secret_password',
  {
    host: process.env.DB_HOST || 'postgres_db',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false, // Para que la consola esté limpia
  }
);

module.exports = sequelize;