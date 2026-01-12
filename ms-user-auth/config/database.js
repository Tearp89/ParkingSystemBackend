const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'parking_master', 
  process.env.DB_USER || 'user_dev',
  process.env.DB_PASS || 'secret_password',
  {
    host: process.env.DB_HOST || 'postgres_db',
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;