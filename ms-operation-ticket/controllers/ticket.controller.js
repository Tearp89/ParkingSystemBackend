const ticketService = require('../services/ticket.service');
const axios = require('axios');

/**
 * CU-03: Registrar entrada de vehículo
 */
exports.entry = async (req, res) => {
    try {
        // Desestructuramos el nuevo campo enviado desde el frontend
        const { branch_id, vehicle_plate, spot_id, vehicle_type_id } = req.body;
        
        // Validamos que el tipo de vehículo no venga vacío
        if (!vehicle_type_id) {
            return res.status(400).json({ error: "El tipo de vehículo es obligatorio para la tarifa." });
        }

        const ticket = await ticketService.registerEntry(
            branch_id, 
            vehicle_plate, 
            spot_id, 
            vehicle_type_id // Nuevo parámetro
        );
        
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
        
        // Extraemos el token JWT que el frontend envió en los headers
        const userToken = req.headers.authorization; 
        
        if (!userToken) {
            return res.status(401).json({ error: "No se proporcionó token de autorización." });
        }

        const result = await ticketService.processExit(ticketId, userToken);
        
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
        const paymentData = { ...req.body, user_id: req.user.user_id };

        // 1. Lógica local
        const ticket = await ticketService.confirmPayment(ticketId, paymentData);
        const userToken = req.headers.authorization;

        // 2. Comunicación interna Docker (ms-operation-ticket -> ms-financial-cash)
        try {
    // La URL debe incluir el prefijo /api/v1/financial que definiste en app.js
    const FINANCIAL_URL = 'http://ms-financial-cash:3005/api/v1/financial/pay';
    
    console.log("Intentando registrar pago en:", FINANCIAL_URL);

    await axios.post(FINANCIAL_URL, {
        ticket_id: ticketId,
        branch_id: ticket.branch_id,
        user_id: req.user.user_id, // Importante para el corte de caja por usuario
        amount: req.body.total_amount,
        payment_method: req.body.method, // Verifica si tu modelo usa 'method' o 'payment_method'
        transaction_date: new Date()
    }, {
                // AQUÍ ESTÁ LA CLAVE: Reenviamos el header de Authorization
                headers: {
                    'Authorization': userToken 
                }});
    
    console.log("✅ ¡Pago sincronizado con Finanzas!");
} catch (error) {
    if (error.response) {
        // El servidor respondió con algo distinto a 2xx
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
        const { branch_id, vehicle_type_id, entry_time } = req.body;
        // Llama a la lógica que ya tienes en tu service
        const result = await tariffService.calculateAmount(branch_id, vehicle_type_id, entry_time);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};