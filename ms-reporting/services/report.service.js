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
async getRevenue(branchId) {
    // 1. Quitamos el filtro de fechas para que traiga TODO el histórico
    const whereClause = {
        status: 'PAID' // Solo sumamos lo que ya se cobró
    };
    
    if (branchId) whereClause.branch_id = branchId;

    // 2. Sumamos de la tabla Ticket porque Payment no tiene registros
    const revenueData = await db.Ticket.findAll({
        attributes: [
            // Usamos exit_time como la fecha de la transacción
            [db.sequelize.fn('DATE', db.sequelize.col('exit_time')), 'date'],
            [db.sequelize.fn('SUM', db.sequelize.col('total_amount')), 'daily_total']
        ],
        where: whereClause,
        group: [db.sequelize.fn('DATE', db.sequelize.col('exit_time'))],
        order: [[db.sequelize.fn('DATE', db.sequelize.col('exit_time')), 'DESC']]
    });

    // 3. Suma total para el KPI principal
    const totalOverall = await db.Ticket.sum('total_amount', { where: whereClause });

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