const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { verifyJWT, authorize } = require('../middleware/auth.middleware');

// --- CU-03: Registrar entrada ---
router.post('/entry', 
    verifyJWT, 
    authorize('ADMIN', 'CASHIER'), 
    ticketController.entry
);

// --- CU-04: Consultar tickets abiertos (Patio) ---
// Usamos branchId como parámetro para que el cajero vea solo lo de su sucursal
router.get('/active/:branchId', 
    verifyJWT, 
    authorize('ADMIN', 'CASHIER', 'SUPERVISOR'), 
    ticketController.listActive
);

// --- CU-05: Registrar salida y calcular importe ---
// Paso 1: Obtener cálculo de tiempo y costo
router.get('/exit-calculation/:ticketId', 
    verifyJWT, 
    authorize('ADMIN', 'CASHIER'), 
    ticketController.calculateExit
);

// Paso 2: Confirmar el cobro y cerrar el ticket
router.post('/payment/:ticketId', 
    verifyJWT, 
    authorize('ADMIN', 'CASHIER'), 
    ticketController.confirmPayment
);

// --- CU-06: Anular ticket ---
// Solo permitido para Supervisor y Administrador
router.put('/void/:ticketId', 
    verifyJWT, 
    authorize('ADMIN', 'SUPERVISOR'), 
    ticketController.voidTicket
);

router.post('/calculate', ticketController.calculateAmount);

// ¡ESTA LÍNEA ES VITAL!
module.exports = router;