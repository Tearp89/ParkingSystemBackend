// ms-reporting/controllers/report.controller.js
const reportService = require('../services/report.service');

exports.getOccupancy = async (req, res) => {
    try {
        const { branchId } = req.params;
        const data = await reportService.getOccupancy(branchId);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getRevenue = async (req, res) => {
    try {
        // Obtenemos fechas de los query params (ej: ?startDate=2025-01-01&endDate=2025-01-31)
        const { branchId, startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Se requieren fechas de inicio y fin." });
        }

        const data = await reportService.getRevenue(branchId, new Date(startDate), new Date(endDate));
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};