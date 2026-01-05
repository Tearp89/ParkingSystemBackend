// ms-core-branch/controllers/branch.controller.js
const branchService = require('../services/branch.service');

// CU-01: Registrar Sucursal
exports.createBranch = async (req, res) => {
    try {
        const newBranch = await branchService.createBranch(req.body);
        return res.status(201).json({ 
            message: "Sucursal registrada exitosamente.", 
            branch: newBranch 
        });
    } catch (error) {
        console.error("Error al crear sucursal:", error.message);
        return res.status(400).json({ error: error.message });
    }
};

// CU-01/CU-08: Listar todas las sucursales
exports.listBranches = async (req, res) => {
    try {
        const branches = await branchService.listBranches();
        return res.status(200).json(branches);
    } catch (error) {
        console.error("Error al listar sucursales:", error.message);
        return res.status(500).json({ error: "Error interno del servidor al obtener sucursales." });
    }
};

// RF-01: Editar sucursal y Cambiar Estado (Activar/Desactivar)
exports.updateBranch = async (req, res) => {
    const { branchId } = req.params;
    try {
        const updatedBranch = await branchService.updateBranch(branchId, req.body);
        return res.status(200).json({ 
            message: "Sucursal actualizada correctamente.", 
            branch: updatedBranch 
        });
    } catch (error) {
        console.error("Error al actualizar sucursal:", error.message);
        return res.status(400).json({ error: error.message });
    }
};

// CU-02: Agregar lugar de estacionamiento
exports.addParkingSpot = async (req, res) => {
    const { branchId } = req.params; 
    try {
        const newSpot = await branchService.addParkingSpot(branchId, req.body);
        return res.status(201).json({ 
            message: "Lugar de estacionamiento creado.", 
            spot: newSpot 
        });
    } catch (error) {
        console.error("Error al crear lugar:", error.message);
        return res.status(400).json({ error: error.message });
    }
};

// CU-02: Actualizar lugar de estacionamiento (Estado o tipo)
exports.updateParkingSpot = async (req, res) => {
    const { branchId, spotId } = req.params;
    try {
        const updatedSpot = await branchService.updateParkingSpot(branchId, spotId, req.body);
        return res.status(200).json({ 
            message: "Lugar de estacionamiento actualizado.", 
            spot: updatedSpot 
        });
    } catch (error) {
        console.error("Error al actualizar lugar:", error.message);
        return res.status(400).json({ error: error.message });
    }
};

exports.updateSpotOccupancy = async (req, res) => {
    const { spotId } = req.params;
    const { isOccupied } = req.body; // true para entrada, false para salida
    try {
        const updatedSpot = await branchService.updateSpotOccupancy(spotId, isOccupied);
        return res.status(200).json({ 
            message: "Estado de ocupación actualizado.", 
            spot: updatedSpot 
        });
    } catch (error) {
        console.error("Error al actualizar ocupación:", error.message);
        return res.status(400).json({ error: error.message });
    }
};