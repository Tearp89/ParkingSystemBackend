const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tariff = sequelize.define('Tariff', {
    tariff_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    branch_id: { type: DataTypes.UUID, allowNull: false }, // [cite: 63]
    vehicle_type_id: { type: DataTypes.UUID, allowNull: false }, // [cite: 64]
    
    // Estrategia: hourly (hora), fraction (fracción), step (bloques) [cite: 65]
    strategy: { 
      type: DataTypes.ENUM('hourly', 'fraction', 'step'), 
      allowNull: false 
    },
    
    grace_min: { type: DataTypes.INTEGER, defaultValue: 0 }, // [cite: 66, 124]
    hourly_rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // [cite: 67]
    fraction_min: { type: DataTypes.INTEGER, allowNull: true }, // [cite: 68]
    daily_max: { type: DataTypes.DECIMAL(10, 2), allowNull: true }, // [cite: 69, 124]
    
    // Reglas nocturnas [cite: 70, 124]
    overnight_start: { type: DataTypes.STRING, allowNull: true }, 
    overnight_end: { type: DataTypes.STRING, allowNull: true },
    
    // Vigencia [cite: 71]
    valid_from: { type: DataTypes.DATE, allowNull: false },
    valid_to: { type: DataTypes.DATE, allowNull: true },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'Tariff' });

  return Tariff;
};