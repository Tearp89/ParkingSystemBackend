const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Payment', {
    payment_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ticket_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    method: { type: DataTypes.ENUM('CASH', 'CARD', 'APP'), defaultValue: 'CASH' },
    transaction_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'Payment' });
};