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
    async registerEntry(branchId, plate, spotId) {
        const active = await db.Ticket.findOne({ 
            where: { vehicle_plate: plate, status: 'ACTIVE' } 
        });
        if (active) throw new Error("El vehículo ya tiene una sesión activa.");

        const ticket = await db.Ticket.create({
            branch_id: branchId,
            vehicle_plate: plate,
            spot_id: spotId,
            status: 'ACTIVE',
            entry_time: new Date()
        });

        try {
            await axios.put(`${this.BRANCH_SVC}/spots/${spotId}/occupancy`, { isOccupied: true });
        } catch (error) {
            console.error("Error al sincronizar ocupación en entrada:", error.message);
            // Opcional: Podrías revertir la creación del ticket si la sincronización falla
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
     */
    async processExit(ticketId) {
        const ticket = await db.Ticket.findByPk(ticketId);
        if (!ticket || ticket.status !== 'ACTIVE') {
            throw new Error("Ticket no válido o ya procesado.");
        }

        try {
            const response = await axios.post(`${this.TARIFF_SVC}/calculate`, {
                branch_id: ticket.branch_id,
                entry_time: ticket.entry_time,
                spot_id: ticket.spot_id 
            });

            const { total_amount, stay_minutes, exit_time } = response.data;
            
            return { ticket, stay_minutes, total_amount, exit_time };
        } catch (error) {
            throw new Error("Error al calcular tarifa: " + (error.response?.data?.error || error.message));
        }
    }

    /**
     * CU-05: Confirmar pago y cerrar ticket
     */
    async confirmPayment(ticketId, paymentData) {
        const ticket = await db.Ticket.findByPk(ticketId);
        if (!ticket) throw new Error("Ticket no encontrado.");

        const updatedTicket = await ticket.update({
            status: 'PAID',
            exit_time: paymentData.exit_time,
            total_amount: paymentData.total_amount,
            payment_id: paymentData.payment_id
        });

        // ACTUALIZACIÓN: Notificar a ms-core-branch que el lugar se LIBERÓ
        try {
            await axios.put(`${this.BRANCH_SVC}/spots/${ticket.spot_id}/occupancy`, { isOccupied: false });
        } catch (error) {
            console.error("Error al sincronizar ocupación en salida:", error.message);
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

        // ACTUALIZACIÓN: Liberar el lugar si el ticket se anula
        try {
            await axios.put(`${this.BRANCH_SVC}/spots/${ticket.spot_id}/occupancy`, { isOccupied: false });
        } catch (error) {
            console.error("Error al liberar lugar por anulación:", error.message);
        }

        return updatedTicket;
    }
}

module.exports = new TicketService();