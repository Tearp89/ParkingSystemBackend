const ticketService = require('../services/ticket.service');

exports.entry = async (req, res) => {
    try {
        const { branch_id, vehicle_plate, vehicle_type_id } = req.body;
        const ticket = await ticketService.registerEntry(branch_id, vehicle_plate, vehicle_type_id);
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.calculateExit = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const result = await ticketService.processExit(ticketId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};