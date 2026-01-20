const ticketService = require('../services/ticket.service');
const axios = require('axios');

/**
 * CU-03: Registrar entrada de vehículo
 */
exports.entry = async (req, res) => {
    try {
        
        const { branch_id, vehicle_plate, spot_id, vehicle_type_id, tariff_id } = req.body;
        
        
        if (!vehicle_type_id) {
            return res.status(400).json({ error: "El tipo de vehículo es obligatorio para la tarifa." });
        }

        const ticket = await ticketService.registerEntry(
            branch_id, 
            vehicle_plate, 
            spot_id, 
            vehicle_type_id,
            tariff_id 
        );
        
        res.status(201).json({
            message: "Ticket de entrada generado exitosamente.",
            ticket
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log("DATA DEL ERROR:", error);
        console.error(error);
        //showMsg(err.response?.data?.message || "Error 400: Datos inválidos", "error");
    }
};

/**
 * CU-04: Consultar tickets abiertos (Patio)
 */
exports.listActive = async (req, res) => {
    try {
        
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
        
       
        const { tariff_id } = req.query; 
        
        console.log("📥 Recibido ticketId:", ticketId);
        console.log("📥 Recibido tariff_id desde query:", tariff_id);

        const userToken = req.headers.authorization; 
        if (!userToken) return res.status(401).json({ error: "No token" });

        const result = await ticketService.processExit(ticketId, userToken, tariff_id);
        
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error en calculateExit:", error.message);
        res.status(400).json({ error: error.message });
    }
};

/**
 * CU-05: Confirmar pago (Paso 2 de salida)
 */
exports.confirmPayment = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const paymentData = { ...req.body, user_id: req.user.user_id };

        const ticket = await ticketService.confirmPayment(ticketId, paymentData);
        const userToken = req.headers.authorization;

        try {
    const FINANCIAL_URL = 'http://ms-financial-cash:3005/api/v1/financial/pay';
    
    console.log("Intentando registrar pago en:", FINANCIAL_URL);

    await axios.post(FINANCIAL_URL, {
        ticket_id: ticketId,
        branch_id: ticket.branch_id,
        user_id: req.user.user_id, 
        amount: req.body.total_amount,
        payment_method: req.body.method, 
        transaction_date: new Date()
    }, {
                
                headers: {
                    'Authorization': userToken 
                }});
    
    console.log("✅ ¡Pago sincronizado con Finanzas!");
} catch (error) {
    if (error.response) {
        console.error(`❌ Error ${error.response.status}:`, error.response.data);
    } else {
        console.error("❌ Error de conexión:", error.message);
    }
}

        res.status(200).json({ message: "Pago registrado", ticket });
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
       
        const { tariff_id, entry_time } = req.body;

        if (!tariff_id) {
            return res.status(400).json({ error: "El ID de tarifa es obligatorio para calcular el monto." });
        }

        const result = await tariffService.calculateAmount(tariff_id, entry_time);
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};