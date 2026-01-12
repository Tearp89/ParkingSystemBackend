const db = require('../models');
const axios = require('axios');
const { Op } = require('sequelize');

class FinancialService {
    constructor() {
        this.TICKET_SVC_URL = process.env.TICKET_SERVICE_URL || 'http://ms-operation-ticket:3004/api/v1/tickets';
    }

async registerPayment(paymentData) {
    const { ticket_id, amount, method, user_id, branch_id } = paymentData;

    try {
        
        
        
        const payment = await db.Payment.create({ 
            ticket_id, 
            user_id, 
            branch_id, 
            amount, 
            method,
            transaction_date: new Date()
        });

       

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
        cash_closing_id: null 
    };

    if (type === 'USER') {
        whereClause.user_id = userId;
    }

    const transactions = await db.Payment.findAll({ where: whereClause });
    const totalExpected = transactions.reduce((acc, p) => acc + Number(p.amount), 0);

    
    const difference = parseFloat(reportedAmount) - parseFloat(totalExpected);

    const cut = await db.CashCut.create({
        user_id: userId, 
        branch_id: branchId,
        type: type,
        total_expected: totalExpected,
        total_reported: reportedAmount,
        difference: difference,
        status: 'CLOSED'
    });

    if (transactions.length > 0) {
        await db.Payment.update(
            { cash_closing_id: cut.cut_id }, 
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