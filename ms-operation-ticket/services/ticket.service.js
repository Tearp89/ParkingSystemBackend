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
        // 1. Validar si el vehículo ya está adentro
        const active = await db.Ticket.findOne({
            where: { vehicle_plate: plate, status: 'ACTIVE' }
        });
        if (active) throw new Error("El vehículo ya tiene una sesión activa.");

        // 2. NUEVA VALIDACIÓN: Verificar si el lugar está ocupado en la base de datos de tickets
        // Esto evita que dos procesos usen el mismo spot_id al mismo tiempo
        const spotOccupied = await db.Ticket.findOne({
            where: { spot_id: spotId, status: 'ACTIVE' }
        });
        if (spotOccupied) throw new Error("Este lugar acaba de ser ocupado. Elige otro.");

        // 3. Crear el ticket
        const ticket = await db.Ticket.create({
            branch_id: branchId,
            vehicle_plate: plate,
            spot_id: spotId,
            vehicle_type_id: vehicleTypeId,
            status: 'ACTIVE',
            entry_time: new Date()
        });

        // 4. Sincronización (MS-CORE-BRANCH)
        try {
            // Asegúrate que la URL en this.BRANCH_SVC sea: http://ms-core-branch:3001/api/v1/branches
            // Si el router de branch tiene '/spots/:id/occupancy', revisa si no sobra la palabra 'branches'
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
    async processExit(ticketId, userToken) {
        const ticket = await db.Ticket.findByPk(ticketId);
        if (!ticket || ticket.status !== 'ACTIVE') {
            throw new Error("Ticket no válido o ya procesado.");
        }

        try {
            // CORRECCIÓN: Si this.TARIFF_SVC ya es .../api/v1/tariffs, 
            // solo concatenamos /calculate
            const response = await axios.post(`${this.TARIFF_SVC}/calculate`, {
                branch_id: ticket.branch_id,
                entry_time: ticket.entry_time,
                vehicle_type_id: ticket.vehicle_type_id // normal, moto, pcd, ev
            }, {
                headers: {
                    'Authorization': userToken // Reenvío del token para autorizar la llamada interna
                }
            });

            const { total_amount, stay_minutes, tariff_id } = response.data;

            ticket.total_amount = total_amount;
            ticket.exit_time = new Date();
            ticket.tariff_id = tariff_id;
            await ticket.save();

            return { ticket, stay_minutes, total_amount };
        } catch (error) {
            console.error("Error detallado del calculador:", error.response?.data);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error al calcular tarifa";
            throw new Error(errorMsg);
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
            total_amount: paymentData.total_amount
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