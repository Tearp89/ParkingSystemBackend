
const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
router.post('/', /* authMiddleware.authorize('ADMIN'), */ branchController.createBranch);
// router.get('/', /* authMiddleware.authorize('ADMIN'), */ branchController.listBranches);

// Rutas de Lugares (Requiere rol ADMIN o SUPERVISOR)
router.post('/:branchId/spots', /* authMiddleware.authorize('ADMIN', 'SUPERVISOR'), */ branchController.addParkingSpot);
// router.put('/:branchId/spots/:spotId', /* authMiddleware.authorize('ADMIN', 'SUPERVISOR'), */ branchController.updateParkingSpot);

module.exports = router;