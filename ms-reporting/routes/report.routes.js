const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyJWT, authorize } = require('../middleware/auth.middleware');

router.get('/occupancy/:branchId', verifyJWT, authorize('ADMIN', 'SUPERVISOR'), reportController.getOccupancy);

router.get('/revenue', verifyJWT, authorize('ADMIN', 'SUPERVISOR'), reportController.getRevenue);

router.get('/tickets', verifyJWT, authorize('ADMIN', 'SUPERVISOR'), reportController.getDetailedTickets);

module.exports = router;