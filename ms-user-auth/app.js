const express = require('express');
const sequelize = require('./config/database');
const db = require('./models');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use('/api/v1/auth', authRoutes);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('📦 MS-AUTH: Conectado a PostgreSQL.');

        // Sincronizar modelos
        await db.sequelize.sync({ force: false }); 
        console.log('Modelos de Auth sincronizados.');

        app.listen(PORT, () => {
            console.log(`🚀 MS-USER-AUTH corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar MS-AUTH:', error);
        process.exit(1); // Esto hace que el contenedor se detenga si hay error
    }
}

startServer();