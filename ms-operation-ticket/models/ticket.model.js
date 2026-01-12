const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ticket = sequelize.define('Ticket', {
    ticket_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    spot_id: { type: DataTypes.UUID, allowNull: false },
    vehicle_type_id: { type: DataTypes.STRING, allowNull: false },
    vehicle_plate: { type: DataTypes.STRING, allowNull: false }, 
    entry_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    exit_time: { type: DataTypes.DATE, allowNull: true },
    status: { 
      type: DataTypes.ENUM('ACTIVE', 'PAID', 'COMPLETED', 'CANCELLED'), 
      defaultValue: 'ACTIVE' 
    },
    total_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    payment_id: { type: DataTypes.UUID, allowNull: true } 
  }, { tableName: 'Ticket' });

  return Ticket;
};