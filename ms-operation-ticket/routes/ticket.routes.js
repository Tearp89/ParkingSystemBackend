const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { verifyJWT, authorize } = require('../middleware/auth.middleware');

router.post('/entry', 
    verifyJWT, 
    authorize('ADMIN', 'SUPERVISOR', 'CASHIER'), 
    ticketController.entry
);

router.get('/active/:branchId', 
    verifyJWT, 
    authorize('ADMIN', 'CASHIER', 'SUPERVISOR'), 
    ticketController.listActive
);

router.get('/exit-calculation/:ticketId', 
    verifyJWT, 
    authorize('SUPERVISOR', 'CASHIER'), 
    ticketController.calculateExit
);

router.post('/payment/:ticketId', 
    verifyJWT, 
    authorize('SUPERVISOR', 'CASHIER'), 
    ticketController.confirmPayment
);

router.put('/void/:ticketId', 
    verifyJWT, 
    authorize('ADMIN', 'SUPERVISOR'), 
    ticketController.voidTicket
);

router.post('/calculate', ticketController.calculateAmount);


module.exports = router;