const db = require('../models');

class TariffService {

    /**
     * CU-07: Configurar nueva tarifa.
     * Ahora solo crea la tarifa. No desactiva ninguna otra automáticamente.
     */
    async createTariff(data) {
        // Simplemente creamos la nueva entrada en el historial.
        // El modelo ya tiene active: true por defecto
        return await db.Tariff.create({
            ...data,
            valid_from: data.valid_from || new Date(),
            active: true // La nueva se crea activa, pero no toca las demás
        });
    }

    /**
     * Nuevo método para cambiar el estado manualmente (Activar/Desactivar)
     */
    async updateStatus(tariff_id, active) {
        return await db.Tariff.update(
            { active },
            { where: { tariff_id } }
        );
    }
    /**
     * Calcula el importe basado en minutos y tipo de vehículo (RF-05).
     */
async calculateAmount(tariff_id, entry_time) {
        const exit_time = new Date();
        // Cálculo de minutos de estancia
        const stay_minutes = Math.floor((exit_time - new Date(entry_time)) / 60000); 
        const tariff = await db.Tariff.findByPk(tariff_id);
        // Buscar tarifa vigente para el tipo específico (normal, moto, pcd, ev)
        // CORRECCIÓN: Usamos db.Sequelize.Op que definimos en models/index.js
        

        if (!tariff) throw new Error(`No se encontró tarifa activa con el ID: ${tariff_id}`);

        // 1. Aplicar minutos de gracia
        if (stay_minutes <= tariff.grace_min) {
            return {
                stay_minutes,
                total_amount: 0,
                tariff_id: tariff.tariff_id
            };
        }

        let amount = 0;

        // 2. Aplicar estrategia de cobro
        switch (tariff.strategy) {
            case 'hourly':
                // Se cobra la hora completa iniciada
                amount = Math.ceil(stay_minutes / 60) * tariff.hourly_rate;
                break;
            case 'fraction':
                // Cálculo por fracciones (ej: cada 15 min)
                const fraction_size = tariff.fraction_min || 15;
                const fractions = Math.ceil(stay_minutes / fraction_size);
                const price_per_fraction = tariff.hourly_rate / (60 / fraction_size);
                amount = fractions * price_per_fraction;
                break;
            default:
                amount = Math.ceil(stay_minutes / 60) * tariff.hourly_rate;
        }

        // 3. Aplicar máximo diario
        if (tariff.daily_max && tariff.daily_max > 0 && amount > tariff.daily_max) {
            amount = tariff.daily_max;
        }

        return {
        stay_minutes,
        total_amount: Number(amount),
        tariff_id: tariff.tariff_id,
        tariff_name: tariff.name // Agregamos el nombre para que el ticket de salida sea claro
    };
    }

    
}

module.exports = new TariffService();