const db = require('../models');
const BranchModel = db.Branch;
const SpotModel = db.ParkingSpot;

class BranchService {
    /**
     * Crea una nueva sucursal (CU-01).
     */
    async createBranch(branchData) {
        if (!branchData.capacity || branchData.capacity <= 0) {
            throw new Error("La capacidad debe ser un número positivo.");
        }
        
        try {
            const newBranch = await BranchModel.create(branchData);
            return newBranch;
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new Error("El código de sucursal ya existe.");
            }
            throw error;
        }
    }

    /**
     * Lista todas las sucursales con sus lugares (CU-01/08).
     */
    async listBranches() {
        return await BranchModel.findAll({
            include: [{ model: SpotModel, as: 'spots' }],
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Obtiene una sucursal por ID.
     */
    async getBranchById(branchId) {
        return await BranchModel.findByPk(branchId, {
            include: [{ model: SpotModel, as: 'spots' }],
        });
    }

    /**
     * Actualiza una sucursal o cambia su estado 'active' (RF-01).
     * Este método sirve tanto para editar texto como para el toggle de estado.
     */
    async updateBranch(branchId, updateData) {
        const branch = await BranchModel.findByPk(branchId);
        
        if (!branch) {
            throw new Error("Sucursal no encontrada.");
        }

        // Si se intenta cambiar la capacidad, verificar que no sea menor a los spots existentes
        if (updateData.capacity) {
            const currentSpots = await SpotModel.count({ where: { branch_id: branchId } });
            if (updateData.capacity < currentSpots) {
                throw new Error(`No puedes reducir la capacidad a ${updateData.capacity} porque ya existen ${currentSpots} lugares registrados.`);
            }
        }

        try {
            return await branch.update(updateData);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new Error("El código ya está en uso por otra sucursal.");
            }
            throw error;
        }
    }

    /**
     * Registra un nuevo lugar de estacionamiento (CU-02).
     */
    async addParkingSpot(branchId, spotData) {
        const branch = await this.getBranchById(branchId);
        if (!branch) {
            throw new Error("Sucursal no encontrada.");
        }

        const currentSpotsCount = await SpotModel.count({ where: { branch_id: branchId } });
        if (currentSpotsCount >= branch.capacity) {
            throw new Error("Se ha alcanzado la capacidad máxima de la sucursal.");
        }

        return await SpotModel.create({ ...spotData, branch_id: branchId });
    }

    /**
     * Actualiza un lugar de estacionamiento (CU-02).
     */
    async updateParkingSpot(branchId, spotId, spotData) {
        const spot = await SpotModel.findOne({ 
            where: { spot_id: spotId, branch_id: branchId } 
        });
        
        if (!spot) throw new Error("Lugar de estacionamiento no encontrado en esta sucursal.");
        
        return await spot.update(spotData);
    }

    async updateSpotOccupancy(spotId, isOccupied) {
    const spot = await SpotModel.findByPk(spotId);
    
    if (!spot) {
        throw new Error("Lugar de estacionamiento no encontrado.");
    }

    // Actualizamos el campo is_occupied definido en el modelo ParkingSpot
    return await spot.update({ is_occupied: isOccupied });
}
}

module.exports = new BranchService();