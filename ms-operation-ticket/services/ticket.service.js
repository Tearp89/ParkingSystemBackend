const db = require('../models');
const axios = require('axios');
const { Op } = require('sequelize');

class TicketService {
    constructor() {
        this.BRANCH_SVC = process.env.BRANCH_SERVICE_URL || 'http://localhost:3001/api/v1/branches';
        this.TARIFF_SVC = process.env.TARIFF_SERVICE_URL || 'http://localhost:3003/api/v1/tariffs';
    }

    /**
     * CU-03: Registrar entrada de vehículo
     */
    async registerEntry(branchId, plate, spotId, vehicleTypeId) {
        const active = await db.Ticket.findOne({
            where: { vehicle_plate: plate, status: 'ACTIVE' }
        });
        if (active) throw new Error("El vehículo ya tiene una sesión activa.");

        const spotOccupied = await db.Ticket.findOne({
            where: { spot_id: spotId, status: 'ACTIVE' }
        });
        if (spotOccupied) throw new Error("Este lugar acaba de ser ocupado. Elige otro.");

        const ticket = await db.Ticket.create({
            branch_id: branchId,
            vehicle_plate: plate,
            spot_id: spotId,
            vehicle_type_id: vehicleTypeId,
            status: 'ACTIVE',
            entry_time: new Date()
        });

        try {
            console.log(spotId);
            await axios.put(`${this.BRANCH_SVC}/spots/${spotId}/occupancy`, {
                isOccupied: true
            });
        } catch (error) {
            console.error("URL intentada:", `${this.BRANCH_SVC}/spots/${spotId}/occupancy`);
            console.error("Error al sincronizar ocupación:", error.message);
        }

        return ticket;
    }

    /**
     * CU-04: Consultar tickets abiertos (Patio)
     */
    async getActiveTickets(branchId, filters = {}) {
        const where = { branch_id: branchId, status: 'ACTIVE' };

        if (filters.plate) where.vehicle_plate = { [Op.iLike]: `%${filters.plate}%` };
        if (filters.spot_id) where.spot_id = filters.spot_id;

        return await db.Ticket.findAll({
            where,
            order: [['entry_time', 'ASC']]
        });
    }

    /**
         * CU-05: Calcular cobro y preparar salida
         * CORRECCIÓN DE RUTA: Eliminamos el "/tariffs" extra para evitar el error 404
         */
async processExit(ticketId, userToken, manualTariffId = null) {
    const ticket = await db.Ticket.findByPk(ticketId);
    if (!ticket) throw new Error("Ticket no encontrado");

    const tariffToUse = manualTariffId || ticket.tariff_id;

    const response = await axios.post(`${this.TARIFF_SVC}/calculate`, {
        tariff_id: tariffToUse, 
        entry_time: ticket.entry_time,
        branch_id: ticket.branch_id
    }, {
        headers: { 'Authorization': userToken }
    });

    return {
        ticket,
        total_amount: response.data.total_amount,
        stay_minutes: response.data.stay_minutes,
        tariff_id: response.data.tariff_id
    };
}

    /**
     * CU-05: Confirmar pago y cerrar ticket
     */
    async confirmPayment(ticketId, paymentData) {
    const ticket = await db.Ticket.findByPk(ticketId);
    if (!ticket) throw new Error("Ticket no encontrado.");

    const updatedTicket = await ticket.update({
        status: 'PAID',
        exit_time: paymentData.exit_time || new Date(),
        total_amount: paymentData.total_amount
    });

    try {
        const FINANCIAL_SVC = process.env.FINANCIAL_SERVICE_URL || 'http://localhost:3006/api/v1/financial';
        await axios.post(`${FINANCIAL_SVC}/pay`, {
            ticket_id: ticketId,
            amount: paymentData.total_amount,
            method: paymentData.method,
            branch_id: ticket.branch_id, 
            user_id: paymentData.user_id   
        });
    } catch (error) {
        console.error("Error al registrar en finanzas:", error.message);
    }

    try {
        await axios.put(`${this.BRANCH_SVC}/spots/${ticket.spot_id}/occupancy`, { isOccupied: false });
    } catch (error) {
        console.error("Error al liberar lugar:", error.message);
    }

    return updatedTicket;
}

    /**
     * CU-06: Anular ticket (Supervisor)
     */
    async voidTicket(ticketId) {
        const ticket = await db.Ticket.findByPk(ticketId);
        if (!ticket) throw new Error("Ticket no encontrado.");

        const updatedTicket = await ticket.update({ status: 'CANCELLED' });

        try {
            await axios.put(`${this.BRANCH_SVC}/spots/${ticket.spot_id}/occupancy`, { isOccupied: false });
        } catch (error) {
            console.error("Error al liberar lugar por anulación:", error.message);
        }

        return updatedTicket;
    }
}

module.exports = new TicketService();