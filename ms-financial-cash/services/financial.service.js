const db = require('../models');
const axios = require('axios');
const { Op } = require('sequelize');

class FinancialService {
    constructor() {
        this.TICKET_SVC_URL = process.env.TICKET_SERVICE_URL || 'http://localhost:3005/api/v1/tickets';
    }

    async registerPayment(paymentData) {
    const { ticket_id, amount, method, user_id } = paymentData;

    try {
        // 1. Consultar al Microservicio de Tickets para obtener la info del ticket
        // Necesitamos saber de qué sucursal es ese ticket
        const ticketResponse = await axios.get(`${this.TICKET_SVC_URL}/${ticket_id}`);
        const branch_id = ticketResponse.data.branch_id; 

        // 2. Crear el pago usando el branch_id que recuperamos del ticket
        const payment = await db.Payment.create({ 
            ticket_id, 
            user_id, 
            branch_id, // <--- Ahora sí tenemos el ID de la sucursal
            amount, 
            method 
        });

        // 3. Notificar al servicio de tickets que ya se pagó
        await axios.patch(`${this.TICKET_SVC_URL}/${ticket_id}/pay`, {
            status: 'PAID',
            payment_id: payment.payment_id
        });

        return payment;
    } catch (error) {
        console.error("Error al registrar pago:", error.message);
        throw new Error("No se pudo recuperar la información de la sucursal del ticket.");
    }
}

    async generateCashCut(branchId, userId, reportedAmount, type = 'USER') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const whereClause = { 
            branch_id: branchId,
            transaction_date: { [Op.gte]: today }
        };

        // Si es corte por usuario, filtramos solo lo que él cobró
        if (type === 'USER') {
            whereClause.user_id = userId;
        }

        // 1. Calcular lo que el sistema dice que debería haber
        const totalExpected = await db.Payment.sum('amount', { where: whereClause }) || 0;

        // 2. Calcular diferencia
        const difference = parseFloat(reportedAmount) - parseFloat(totalExpected);

        // 3. Crear el registro del corte (se guarda quién lo ejecutó)
        return await db.CashCut.create({
            user_id: type === 'USER' ? userId : null, // El responsable
            branch_id: branchId,
            type: type,
            total_expected: totalExpected,
            total_reported: reportedAmount,
            difference: difference,
            status: 'CLOSED'
        });
    }
}

module.exports = new FinancialService();