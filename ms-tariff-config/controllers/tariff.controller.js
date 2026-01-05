const tariffService = require('../services/tariff.service');
const db = require('../models');

// CU-07: Configurar tarifas por sucursal [cite: 60]
exports.createTariff = async (req, res) => {
    try {
        // Se espera branch_id, vehicle_type_id, strategy, hourly_rate, etc. [cite: 64, 65, 67]
        const newTariff = await db.Tariff.create(req.body);
        res.status(201).json({ message: "Tarifa configurada exitosamente", data: newTariff });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// CU-05: Calcular importe (Llamado por el cajero o ms-operation) [cite: 47, 51]
exports.getCalculation = async (req, res) => {
    const { branch_id, vehicle_type_id, entry_time } = req.body;
    
    try {
        const result = await tariffService.calculateAmount(branch_id, vehicle_type_id, entry_time);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// CU-08: Ver historial de tarifas [cite: 72]
exports.getHistory = async (req, res) => {
    try {
        const history = await db.Tariff.findAll({
            where: { branch_id: req.params.branchId },
            order: [['valid_from', 'DESC']]
        });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * NUEVO MÉTODO: Permite cambiar el estado de una tarifa específica.
 * Responde a la lógica de activar/desactivar manualmente desde el historial.
 */
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params; // ID de la tarifa
        const { active } = req.body; // Nuevo estado (true/false)

        if (typeof active !== 'boolean') {
            return res.status(400).json({ error: "El campo 'active' debe ser booleano" });
        }

        await tariffService.updateStatus(id, active);
        res.json({ message: `Tarifa ${active ? 'activada' : 'desactivada'} correctamente.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};