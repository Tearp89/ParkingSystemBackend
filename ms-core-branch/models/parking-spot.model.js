
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ParkingSpot = sequelize.define('ParkingSpot', {
    spot_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    branch_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kind: {
      type: DataTypes.ENUM('normal', 'disabled', 'ev', 'moto'),
      defaultValue: 'normal',
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'ParkingSpot',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['branch_id', 'number'],
      },
    ],
  });

  ParkingSpot.associate = (models) => {
    ParkingSpot.belongsTo(models.Branch, {
      foreignKey: 'branch_id',
      as: 'branch',
    });
  };

  return ParkingSpot;
};