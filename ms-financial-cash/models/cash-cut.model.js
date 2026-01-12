const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CashCut', {
    cut_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    parent_cut_id: {
      type: DataTypes.UUID,
      allowNull: true, 
    },
    user_id: { type: DataTypes.UUID, allowNull: false }, 
    branch_id: { type: DataTypes.UUID, allowNull: false },
    type: { 
      type: DataTypes.ENUM('USER', 'GENERAL'), 
      defaultValue: 'USER' 
    },
    total_expected: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_reported: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    difference: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    status: { type: DataTypes.ENUM('OPEN', 'CLOSED'), defaultValue: 'CLOSED' }
  }, { tableName: 'CashCut' });
};