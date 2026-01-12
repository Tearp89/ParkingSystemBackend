const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');


router.put('/spots/:spotId/occupancy', branchController.updateSpotOccupancy);

router.post('/', branchController.createBranch);

router.get('/', branchController.listBranches);

router.put('/:branchId', branchController.updateBranch);

router.post('/:branchId/spots', branchController.addParkingSpot);

router.put('/:branchId/spots/:spotId', branchController.updateParkingSpot);
router.get('/:branchId', branchController.getBranchById);


module.exports = router;