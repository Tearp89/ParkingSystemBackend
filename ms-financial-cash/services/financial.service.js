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

    // 1. Definir el filtro de búsqueda
    const whereClause = { 
        branch_id: branchId,
        cash_closing_id: null // Solo lo que no se ha cortado
    };

    // Si es corte individual, filtramos por el cajero
    if (type === 'USER') {
        whereClause.user_id = userId;
    }

    // 2. Calcular lo que el sistema dice que debería haber
    const transactions = await db.Payment.findAll({ where: whereClause });
    const totalExpected = transactions.reduce((acc, p) => acc + Number(p.amount), 0);

    // 3. Calcular diferencia
    const difference = parseFloat(reportedAmount) - parseFloat(totalExpected);

    // 4. Crear el registro del corte (se guarda quién lo ejecutó)
    const cut = await db.CashCut.create({
        user_id: userId, // Siempre guardamos quién lo hizo
        branch_id: branchId,
        type: type,
        total_expected: totalExpected,
        total_reported: reportedAmount,
        difference: difference,
        status: 'CLOSED'
    });

    // --- EL PASO CLAVE: Marcamos los pagos como cerrados ---
    if (transactions.length > 0) {
        await db.Payment.update(
            { cash_closing_id: cut.cut_id }, // Vinculamos al ID del corte recién creado
            { 
                where: { 
                    payment_id: transactions.map(t => t.payment_id) 
                } 
            }
        );
    }

    return cut;
}
}

module.exports = new FinancialService();