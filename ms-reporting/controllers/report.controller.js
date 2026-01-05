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
        const { branchId, startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Se requieren fechas de inicio y fin." });
        }

        const data = await reportService.getRevenue(
            branchId, 
            new Date(startDate), 
            new Date(endDate)
        );
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// CU-15: Obtener listado de tickets con filtros detallados
exports.getDetailedTickets = async (req, res) => {
    try {
        // Recibe branchId, plate, status, startDate, endDate desde query params
        const data = await reportService.getDetailedTickets(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};