const db = require('../models');

class TariffService {
    /**
     * Calcula el importe basado en minutos y tipo de vehículo (RF-05).
     */
    async calculateAmount(branch_id, vehicle_type_id, entry_time) {
        const exit_time = new Date();
        const stay_minutes = Math.floor((exit_time - new Date(entry_time)) / 60000); // [cite: 50]

        // Buscar tarifa vigente [cite: 51, 71]
        const tariff = await db.Tariff.findOne({
            where: { 
                branch_id, 
                vehicle_type_id, 
                active: true,
                valid_from: { [db.Sequelize.Op.lte]: exit_time }
            }
        });

        if (!tariff) throw new Error("No se encontró una tarifa válida para esta sucursal/vehículo.");

        // 1. Aplicar minutos de gracia [cite: 66, 124]
        if (stay_minutes <= tariff.grace_min) return 0;

        let amount = 0;

        // 2. Aplicar estrategia de cobro [cite: 65, 122]
        switch (tariff.strategy) {
            case 'hourly':
                amount = Math.ceil(stay_minutes / 60) * tariff.hourly_rate;
                break;
            case 'fraction':
                // Ejemplo: Cobro por cada 15 min [cite: 68]
                const fractions = Math.ceil(stay_minutes / tariff.fraction_min);
                amount = fractions * (tariff.hourly_rate / (60 / tariff.fraction_min));
                break;
            case 'step':
                // Lógica para bloques de tiempo (ej: primera hora $20, siguientes $10)
                amount = this._calculateStepPricing(stay_minutes, tariff);
                break;
        }

        // 3. Aplicar máximo diario [cite: 69, 124]
        if (tariff.daily_max && amount > tariff.daily_max) {
            amount = tariff.daily_max;
        }

        return {
            stay_minutes,
            total_amount: parseFloat(amount).toFixed(2),
            tariff_id: tariff.tariff_id
        };
    }
}

module.exports = new TariffService();