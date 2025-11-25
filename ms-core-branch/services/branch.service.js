// ms-core-branch/services/branch.service.js

const db = require('../models');
const BranchModel = db.Branch;
const SpotModel = db.ParkingSpot;

class BranchService {
    /**
     * Crea una nueva sucursal (CU-01).
     * @param {object} branchData Datos de la sucursal (code, name, capacity, timezone, etc.)
     * @returns {Promise<Branch>} La sucursal creada.
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
     * Obtiene una sucursal por ID.
     * @param {string} branchId ID de la sucursal.
     * @returns {Promise<Branch>} La sucursal o null.
     */
    async getBranchById(branchId) {
        return BranchModel.findByPk(branchId, {
            include: [{ model: SpotModel, as: 'spots' }],
        });
    }

    /**
     * Registra un nuevo lugar de estacionamiento (CU-02).
     * @param {string} branchId ID de la sucursal.
     * @param {object} spotData Datos del lugar (number, kind, level, zone).
     * @returns {Promise<ParkingSpot>} El lugar creado.
     */
    async addParkingSpot(branchId, spotData) {
        const branch = await this.getBranchById(branchId);
        if (!branch) {
            throw new Error("Sucursal no encontrada.");
        }

        const currentSpotsCount = await SpotModel.count({ where: { branch_id: branchId, active: true } });
        if (currentSpotsCount >= branch.capacity) {
             throw new Error("Se ha alcanzado la capacidad máxima de la sucursal.");
        }

        const newSpot = await SpotModel.create({ ...spotData, branch_id: branchId });
        return newSpot;
    }
    
    //TODO: Aquí irían otros métodos: updateBranch, deleteBranch, updateSpot, getSpotOccupancy.
}

module.exports = new BranchService();