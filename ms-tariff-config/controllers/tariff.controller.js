const tariffService = require('../services/tariff.service');
const db = require('../models');

exports.createTariff = async (req, res) => {
    try {
        const newTariff = await db.Tariff.create(req.body);
        res.status(201).json({ message: "Tarifa configurada exitosamente", data: newTariff });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getCalculation = async (req, res) => {
    const { tariff_id, entry_time } = req.body;

    try {
        const result = await tariffService.calculateAmount(tariff_id, entry_time);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

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

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (typeof active !== 'boolean') {
            return res.status(400).json({ error: "El campo 'active' debe ser booleano" });
        }

        await tariffService.updateStatus(id, active);
        res.json({ message: `Tarifa ${active ? 'activada' : 'desactivada'} correctamente.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getActiveByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;

        if (!branchId || branchId === 'undefined') {
            return res.status(400).json({ error: "El ID de sucursal es requerido" });
        }

        const tariffs = await db.Tariff.findAll({
            where: {
                branch_id: branchId,
                active: true
            },
            order: [['name', 'ASC']]
        });

        res.status(200).json(tariffs);
    } catch (error) {
        console.error("Error en getActiveByBranch:", error);
        res.status(500).json({ error: error.message });
    }
};