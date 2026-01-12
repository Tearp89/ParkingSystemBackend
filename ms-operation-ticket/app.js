require('dotenv').config();
const express = require('express');
const db = require('./models');
const cors = require('cors');
const ticketRoutes = require('./routes/ticket.routes');

const app = express();

app.use(cors());

app.use(express.json());

// Rutas
app.use('/api/v1/tickets', ticketRoutes);

const PORT = process.env.PORT || 3004;

async function start() {
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync();
        app.listen(PORT, () => console.log(`🚀 MS-OPERATION-TICKET en puerto ${PORT}`));
    } catch (e) {
        console.error("Error al iniciar:", e);
    }
}

start();