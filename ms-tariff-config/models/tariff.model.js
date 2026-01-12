const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tariff = sequelize.define('Tariff', {
    tariff_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    branch_id: { type: DataTypes.UUID, allowNull: false }, 
    name: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Tarifa Estándar' },
    
    vehicle_type_id: { type: DataTypes.STRING, allowNull: false }, 
    
    strategy: { 
      type: DataTypes.ENUM('hourly', 'fraction', 'step'), 
      allowNull: false 
    },
    
    grace_min: { type: DataTypes.INTEGER, defaultValue: 0 },
    hourly_rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    fraction_min: { type: DataTypes.INTEGER, allowNull: true },
    daily_max: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    
    overnight_start: { type: DataTypes.STRING, allowNull: true }, 
    overnight_end: { type: DataTypes.STRING, allowNull: true },
    
    valid_from: { type: DataTypes.DATE, allowNull: false },
    valid_to: { type: DataTypes.DATE, allowNull: true },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'Tariff', timestamps: true });

  return Tariff;
};