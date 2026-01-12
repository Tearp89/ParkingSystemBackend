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
        // 1. Extraemos los parámetros, pero ya no son obligatorios
        const { branchId, startDate, endDate } = req.query;
        
        // 2. Llamamos al servicio pasando lo que tengamos. 
        // El servicio se encargará de sumar de "Ticket" porque "Payment" está vacío
        const data = await reportService.getRevenue(
            branchId, 
            startDate, 
            endDate
        );

        // 3. Enviamos todo el histórico al Frontend
        res.status(200).json(data);
    } catch (error) {
        // Si algo falla en la DB, lo atrapamos aquí
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