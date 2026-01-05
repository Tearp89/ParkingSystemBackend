const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariff.controller');
const { verifyJWT, authorize } = require('../middleware/tariff.middleware');

// CU-07: Configurar tarifas (Solo ADMIN) [cite: 62]
router.post('/', verifyJWT, authorize('ADMIN'), tariffController.createTariff);

// CU-05/RF-05: Calcular importe (Llamada interna o por Cajero al cobrar) 
router.post('/calculate', verifyJWT, tariffController.getCalculation);

// CU-08: Ver historial (ADMIN o SUPERVISOR) [cite: 73]
router.get('/history/:branchId', verifyJWT, authorize('ADMIN', 'SUPERVISOR'), tariffController.getHistory);

module.exports = router;