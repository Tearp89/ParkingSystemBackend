const express = require('express');
const sequelize = require('./config/database');
const db = require('./models');
const cors = require('cors');
const tariffRoutes = require('./routes/tariff.routes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({
  origin: 'http://localhost:5173', // Permite solo tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rutas
app.use('/api/v1/tariffs', tariffRoutes);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('📦 MS-TARIFF: Conectado a PostgreSQL.');

        // Sincronizar tablas de tarifas y tipos de vehículo [cite: 172, 176]
        await db.sequelize.sync({ force: false }); 
        
        app.listen(PORT, () => {
            console.log(`🚀 MS-TARIFF corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar MS-TARIFF:', error);
    }
}

startServer();