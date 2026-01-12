const db = require('../models');
const { Op, fn, col } = require('sequelize');

class ReportService {
    // CU-12: Ocupación en tiempo real
    async getOccupancy(branchId) {
        const activeTickets = await db.Ticket.count({
            where: { branch_id: branchId, status: 'ACTIVE' }
        });
        return { branch_id: branchId, occupied_spots: activeTickets };
    }

    // CU-13/14: Ingresos detallados y Dashboard consolidado
    async getRevenue(branchId, startDate, endDate) {
        const whereClause = {
            transaction_date: { [Op.between]: [startDate, endDate] }
        };
        if (branchId) whereClause.branch_id = branchId;

        // Sumar ingresos agrupados por fecha (día) y sucursal
        const revenueData = await db.Payment.findAll({
            attributes: [
                [fn('DATE', col('transaction_date')), 'date'],
                [fn('SUM', col('amount')), 'daily_total'],
                'method'
            ],
            where: whereClause,
            group: [fn('DATE', col('transaction_date')), 'method'],
            order: [[fn('DATE', col('transaction_date')), 'DESC']]
        });

        const totalOverall = await db.Payment.sum('amount', { where: whereClause });

        return {
            total_revenue: totalOverall || 0,
            breakdown: revenueData
        };
    }

    // CU-15: Listado detallado de tickets con filtros
    async getDetailedTickets(filters) {
        const { branchId, plate, status, startDate, endDate } = filters;
        const where = {};

        if (branchId) where.branch_id = branchId;
        if (plate) where.vehicle_plate = { [Op.iLike]: `%${plate}%` };
        if (status) where.status = status;
        if (startDate && endDate) {
            where.entry_time = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        return await db.Ticket.findAll({
            where,
            order: [['entry_time', 'DESC']]
        });
    }
}

module.exports = new ReportService();