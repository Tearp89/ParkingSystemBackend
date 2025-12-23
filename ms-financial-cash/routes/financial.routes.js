const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyJWT, authorize } = require('../middleware/auth.middleware');

// RF-08: Registrar Pago (Cajero)
router.post('/pay', verifyJWT, authorize('CASHIER', 'ADMIN'), paymentController.pay);

// RF-09: Corte de Caja (Cajero/Supervisor)
router.post('/cash-cut', verifyJWT, authorize('CASHIER', 'SUPERVISOR', 'ADMIN'), paymentController.cut);

module.exports = router;