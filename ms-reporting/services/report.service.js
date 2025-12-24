const db = require('../models');
const { Op } = require('sequelize');

class ReportService {
    // CU-12: Reporte de ocupación actual
    async getOccupancy(branchId) {
        // Contar tickets activos en la sucursal
        const activeTickets = await db.Ticket.count({
            where: { branch_id: branchId, status: 'ACTIVE' }
        });
        return { branch_id: branchId, occupied_spots: activeTickets };
    }

    // RF-11: Reporte de ingresos por periodo
    async getRevenue(branchId, startDate, endDate) {
        const total = await db.Payment.sum('amount', {
            where: {
                transaction_date: { [Op.between]: [startDate, endDate] }
            }
        });
        return { branch_id: branchId, total_revenue: total || 0 };
    }
}

module.exports = new ReportService();