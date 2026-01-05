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
    if (!ticket || ticket.status !== 'ACTIVE') throw new Error("Ticket no válido.");

    try {
        // Enviar los datos exactos que espera el ms-tariff-config
        const response = await axios.post(`${this.TARIFF_SVC}/calculate`, {
            branch_id: ticket.branch_id,
            entry_time: ticket.entry_time,
            // Asegúrate de que el ticket tenga este campo guardado desde la entrada
            vehicle_type_id: ticket.vehicle_type_id 
        });

        const { total_amount, stay_minutes, tariff_id } = response.data;
        
        ticket.total_amount = total_amount;
        ticket.exit_time = new Date();
        ticket.tariff_id = tariff_id;
        await ticket.save();

        return { ticket, stay_minutes, total_amount };
    } catch (error) {
        // Si el ms-tariff devuelve 400, aquí capturamos el porqué
        console.error("Error detallado del calculador:", error.response?.data);
        throw new Error(error.response?.data?.error || "Error al calcular tarifa");
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