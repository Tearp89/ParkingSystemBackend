const ticketService = require('../services/ticket.service');

/**
 * CU-03: Registrar entrada de vehículo
 */
exports.entry = async (req, res) => {
    try {
        // Recibimos spot_id en lugar de vehicle_type_id para asignar el lugar físico
        const { branch_id, vehicle_plate, spot_id } = req.body;
        
        const ticket = await ticketService.registerEntry(branch_id, vehicle_plate, spot_id);
        
        res.status(201).json({
            message: "Ticket de entrada generado exitosamente.",
            ticket
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * CU-04: Consultar tickets abiertos (Patio)
 */
exports.listActive = async (req, res) => {
    try {
        // Obtenemos branch_id de los params o del token del usuario
        const { branchId } = req.params; 
        const tickets = await ticketService.getActiveTickets(branchId, req.query);
        
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener vehículos en patio." });
    }
};

/**
 * CU-05: Calcular importe (Paso 1 de salida)
 */
exports.calculateExit = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const result = await ticketService.processExit(ticketId);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * CU-05: Confirmar pago (Paso 2 de salida)
 */
exports.confirmPayment = async (req, res) => {
    try {
        const { ticketId } = req.params;
        // Recibimos monto y exit_time calculados previamente
        const ticket = await ticketService.confirmPayment(ticketId, req.body);
        
        res.status(200).json({
            message: "Pago registrado y ticket cerrado.",
            ticket
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * CU-06: Anular ticket (Supervisor)
 */
exports.voidTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await ticketService.voidTicket(ticketId);
        
        res.status(200).json({
            message: "El ticket ha sido anulado correctamente.",
            ticket
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.calculateAmount = async (req, res) => {
    try {
        const { branch_id, vehicle_type_id, entry_time } = req.body;
        // Llama a la lógica que ya tienes en tu service
        const result = await tariffService.calculateAmount(branch_id, vehicle_type_id, entry_time);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};