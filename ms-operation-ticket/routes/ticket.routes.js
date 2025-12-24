// ms-operation-ticket/routes/ticket.routes.js

const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { verifyJWT, authorize } = require('../middleware/auth.middleware');

// Rutas
router.post('/entry', verifyJWT, authorize('ADMIN', 'CASHIER'), ticketController.entry);
router.post('/exit/:ticketId', verifyJWT, authorize('ADMIN', 'CASHIER'), ticketController.calculateExit);

// ¡ESTA LÍNEA ES VITAL!
module.exports = router;