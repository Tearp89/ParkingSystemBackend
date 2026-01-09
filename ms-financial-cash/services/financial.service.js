const db = require('../models');
const axios = require('axios');
const { Op } = require('sequelize');

class FinancialService {
    constructor() {
        // CORRECCIÓN: Apuntar al contenedor 'ms-operation-ticket' en el puerto 3004
        this.TICKET_SVC_URL = process.env.TICKET_SERVICE_URL || 'http://ms-operation-ticket:3004/api/v1/tickets';
    }

    // ms-financial-cash/services/financial.service.js
async registerPayment(paymentData) {
    // 1. Extraemos branch_id del cuerpo que ahora enviamos desde Tickets
    const { ticket_id, amount, method, user_id, branch_id } = paymentData;

    try {
        // YA NO HACEMOS EL GET: Eliminamos la llamada que daba 404
        
        // 2. Creamos el registro de pago directamente
        const payment = await db.Payment.create({ 
            ticket_id, 
            user_id, 
            branch_id, // Usamos el dato recibido
            amount, 
            method,
            transaction_date: new Date()
        });

        // 3. Notificación de vuelta (Opcional, verifica si tienes esta ruta)
        // Si no tienes el PATCH '/:id/pay' en tickets, puedes comentar esto
        /*
        await axios.patch(`${this.TICKET_SVC_URL}/${ticket_id}/pay`, {
            status: 'PAID'
        }, { headers: { Authorization: ... } });
        */

        return payment;
    } catch (error) {
        console.error("Error al registrar pago en DB:", error.message);
        throw new Error("Error interno al procesar el pago.");
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