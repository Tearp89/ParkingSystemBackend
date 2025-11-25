
const branchService = require('../services/branch.service');

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

