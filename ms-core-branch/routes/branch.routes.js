const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');


// Crear una nueva sucursal
router.post('/', branchController.createBranch);

// Obtener el listado de todas las sucursales (con sus lugares incluidos)
router.get('/', branchController.listBranches);

// Actualizar datos de sucursal o cambiar estado 'active'
router.put('/:branchId', branchController.updateBranch);

// Registrar un nuevo lugar (spot) en una sucursal específica
router.post('/:branchId/spots', branchController.addParkingSpot);

// Actualizar un lugar específico (ej. cambiar tipo de vehículo o inactivar el cajón)
router.put('/:branchId/spots/:spotId', branchController.updateParkingSpot);

router.put('/spots/:spotId/occupancy', branchController.updateSpotOccupancy);

module.exports = router;