const db = require('../models');
const axios = require('axios');

class FinancialService {
    constructor() {
        this.TICKET_SVC_URL = process.env.TICKET_SERVICE_URL || 'http://ms-operation-ticket:3004/api/v1/tickets';
    }

    async registerPayment(paymentData) {
        const { ticket_id, amount, method } = paymentData;

        // 1. Crear el registro de pago en este MS
        const payment = await db.Payment.create({ ticket_id, amount, method });

        // 2. Notificar al microservicio de Tickets para actualizar el estado del ticket
        try {
            await axios.patch(`${this.TICKET_SVC_URL}/${ticket_id}/pay`, {
                status: 'PAID',
                payment_id: payment.payment_id
            });
        } catch (error) {
            console.error("Error al notificar al servicio de tickets:", error.message);
            // Podrías decidir si revertir el pago o manejar el error
        }

        return payment;
    }

    async generateCashCut(branchId, userId, reportedAmount) {
        // Aquí se sumarian todos los pagos del turno para comparar con lo reportado
        const totalExpected = await db.Payment.sum('amount', {
            where: { /* lógica de fechas/turno */ }
        }) || 0;

        const difference = reportedAmount - totalExpected;

        return await db.CashCut.create({
            user_id: userId,
            branch_id: branchId,
            total_expected: totalExpected,
            total_reported: reportedAmount,
            difference: difference
        });
    }
}

module.exports = new FinancialService();