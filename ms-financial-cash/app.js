require('dotenv').config();
const express = require('express');
const db = require('./models');
const cors = require('cors');
const financialRoutes = require('./routes/financial.routes');

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/v1/financial', financialRoutes);

const PORT = process.env.PORT || 3005;

async function start() {
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync({ alter: true });
        app.listen(PORT, () => console.log(`🚀 MS-FINANCIAL-CASH en puerto ${PORT}`));
    } catch (e) {
        console.error("Error al iniciar Financial:", e);
    }
}

start();