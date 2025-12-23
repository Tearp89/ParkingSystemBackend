const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Ticket', {
    ticket_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    spot_id: { type: DataTypes.UUID, allowNull: false },
    vehicle_plate: { type: DataTypes.STRING, allowNull: false },
    entry_time: { type: DataTypes.DATE },
    exit_time: { type: DataTypes.DATE },
    status: { 
      type: DataTypes.ENUM('ACTIVE', 'PAID', 'COMPLETED', 'CANCELLED'), 
      defaultValue: 'ACTIVE' 
    },
    total_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 }
  }, { tableName: 'Ticket' });
};