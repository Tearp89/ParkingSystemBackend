const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariff.controller');
const { verifyJWT, authorize } = require('../middleware/tariff.middleware');

router.post('/', verifyJWT, authorize('ADMIN'), tariffController.createTariff);

router.post('/calculate', verifyJWT, tariffController.getCalculation);

router.get('/history/:branchId', verifyJWT, authorize('ADMIN', 'SUPERVISOR'), tariffController.getHistory);
router.patch('/:id/status', verifyJWT, tariffController.updateStatus);
router.get('/active/:branchId', verifyJWT, authorize('CASHIER', 'SUPERVISRO'), tariffController.getActiveByBranch);

module.exports = router;