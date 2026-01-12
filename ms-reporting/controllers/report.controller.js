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
        
        const data = await reportService.getRevenue(
            branchId, 
            startDate, 
            endDate
        );

        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getDetailedTickets = async (req, res) => {
    try {
        const data = await reportService.getDetailedTickets(req.query);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};