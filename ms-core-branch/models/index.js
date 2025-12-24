const sequelize = require('../config/database');
const Branch = require('./branch.model')(sequelize);
const ParkingSpot = require('./parking-spot.model')(sequelize);

const db = {
    sequelize, // <--- Esto es lo que necesita el app.js para el .sync()
    Branch,
    ParkingSpot
};

// Configurar las asociaciones (relaciones) definidas en los modelos
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;