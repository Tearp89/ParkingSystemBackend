require('dotenv').config();
const express = require('express');
const db = require('./models');
const reportRoutes = require('./routes/report.routes');

const app = express();
app.use(express.json());
app.use('/api/v1/reports', reportRoutes);

const PORT = process.env.PORT || 3006;
db.sequelize.authenticate().then(() => {
    console.log("🚀 MS-REPORTING conectado a DB y listo en puerto " + PORT);
    app.listen(PORT);
});