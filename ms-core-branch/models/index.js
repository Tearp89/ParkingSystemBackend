const sequelize = require('../config/database');
const Branch = require('./branch.model')(sequelize);
const ParkingSpot = require('./parking-spot.model')(sequelize);

const db = {
    sequelize, 
    Branch,
    ParkingSpot
};

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;