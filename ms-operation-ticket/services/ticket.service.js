const db = require('../models');
const axios = require('axios');

class TicketService {
    // URLs de otros servicios (Configurar en .env)
    constructor() {
        this.BRANCH_SVC = process.env.BRANCH_SERVICE_URL || 'http://localhost:3001/api/v1/branches';
        this.TARIFF_SVC = process.env.TARIFF_SERVICE_URL || 'http://localhost:3003/api/v1/tariffs';
    }

    /**
     * Registrar entrada de vehículo (CU-03)
     */
    async registerEntry(branchId, plate, vehicleTypeId) {
        // 1. Validar que la placa no tenga un ticket activo
        const active = await db.Ticket.findOne({ where: { vehicle_plate: plate, status: 'ACTIVE' } });
        if (active) throw new Error("El vehículo ya tiene una sesión activa.");

        // 2. TODO: Llamar a ms-core-branch para asignar un spot disponible
        const spotId = "uuid-de-ejemplo-de-spot"; // Aquí iría la lógica de asignación

        const ticket = await db.Ticket.create({
            branch_id: branchId,
            vehicle_plate: plate,
            spot_id: spotId,
            status: 'ACTIVE'
        });

        return ticket;
    }

    /**
     * Calcular cobro y preparar salida (CU-05)
     */
    async processExit(ticketId) {
        const ticket = await db.Ticket.findByPk(ticketId);
        if (!ticket || ticket.status !== 'ACTIVE') throw new Error("Ticket no válido o ya procesado.");

        // Llamar a ms-tariff-config para calcular el importe
        try {
            const response = await axios.post(`${this.TARIFF_SVC}/calculate`, {
                branch_id: ticket.branch_id,
                entry_time: ticket.entry_time,
                vehicle_type_id: "id-del-vehiculo" // Este dato debería venir del ticket
            });

            const { total_amount, stay_minutes } = response.data;
            
            // Actualizamos el ticket con el monto calculado
            ticket.total_amount = total_amount;
            await ticket.save();

            return { ticket, stay_minutes };
        } catch (error) {
            throw new Error("Error al calcular tarifa: " + error.message);
        }
    }
}

module.exports = new TicketService();