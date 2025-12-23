
const express = require('express');
const sequelize = require('./config/database');
const db = require('./models');
const branchRoutes = require('./routes/branch.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json()); 

app.use('/api/v1/branches', branchRoutes);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a PostgreSQL establecida.');

        await db.sequelize.sync({ force: false }); 
        console.log('Modelos sincronizados con la DB.');

        app.listen(PORT, () => {
            console.log(`🚀 MS-CORE-BRANCH escuchando en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();