const db = require('../models');
const financialService = require('../services/financial.service');
const { Op } = require('sequelize');

exports.pay = async (req, res) => {
    try {
        // Combinamos los datos del formulario con el ID del usuario del token
        const paymentData = {
            ...req.body,
            user_id: req.user.user_id // Tomado del token decodificado
        };

        const payment = await financialService.registerPayment(paymentData);
        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.cut = async (req, res) => {
    try {
        const { branch_id, reported_amount, type } = req.body; 
        // req.user.user_id viene del token JWT decodificado
        const cut = await financialService.generateCashCut(
            branch_id, 
            req.user.user_id, 
            reported_amount, 
            type // 'USER' o 'GENERAL'
        );
        res.status(201).json(cut);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.getHistory = async (req, res) => {
    try {
        const { branch_id, type } = req.query;
        
        const whereClause = {};
        
        // Solo agregamos el filtro si el valor existe y no es una cadena vacía
        if (branch_id && branch_id.trim() !== "") {
            whereClause.branch_id = branch_id;
        }
        
        if (type && type !== 'ALL') {
            whereClause.type = type;
        }

        console.log("Filtros aplicados:", whereClause); // Esto aparecerá en la terminal de VS Code

        const history = await db.CashCut.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json(history || []); 
    } catch (error) {
        console.error("ERROR EN GET_HISTORY:", error);
        // Enviamos el mensaje de error real para saber qué falló (ej: "column branch_id does not exist")
        return res.status(500).json({ error: error.message });
    }
};

exports.getPendingSummary = async (req, res) => {
    try {
        const { branchId } = req.params;

        // 1. Buscamos el último corte GENERAL para saber desde cuándo contar
        const lastClosing = await db.CashCut.findOne({
            where: { branch_id: branchId, type: 'GENERAL' },
            order: [['createdAt', 'DESC']]
        });

        const startTime = lastClosing ? lastClosing.createdAt : new Date(0);

        // 2. Buscamos PAGOS que no tengan un cierre GENERAL asignado
        // Importante: No filtramos por cash_closing_id: null porque queremos incluir 
        // los tickets que ya cerró el cajero pero NO el supervisor.
        const payments = await db.Payment.findAll({
            where: {
                branch_id: branchId,
                createdAt: { [db.Sequelize.Op.gt]: startTime }
            },
            include: [{ model: db.CashCut, as: 'CashClosing', required: false }]
        });

        // Solo procesamos pagos que NO estén vinculados a un corte tipo 'GENERAL'
        const valid = payments.filter(p => !p.CashClosing || p.CashClosing.type === 'USER');

        const total_cash = valid.filter(p => p.method === 'CASH').reduce((acc, p) => acc + Number(p.amount), 0);
        const total_card = valid.filter(p => p.method === 'CARD').reduce((acc, p) => acc + Number(p.amount), 0);

        res.json({
            total_cash,
            total_card,
            total: total_cash + total_card,
            count: valid.length,
            lastClosingDate: lastClosing ? lastClosing.createdAt : null
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createGeneralClosing = async (req, res) => {
    try {
        const { branch_id } = req.body;
        const supervisor_id = req.user.user_id;

        // 1. Buscamos tickets "sueltos" (que no tienen ningún corte)
        const pendingPayments = await db.Payment.findAll({
            where: { branch_id, cash_closing_id: null }
        });

        // 2. Buscamos cortes de usuarios que no se han incluido en un general
        const userCuts = await db.CashCut.findAll({
            where: { branch_id, type: 'USER', parent_cut_id: null }
        });

        if (pendingPayments.length === 0 && userCuts.length === 0) {
            return res.status(400).json({ message: "No hay nada pendiente por cerrar en esta sucursal." });
        }

        // 3. Calculamos el total (Suma de tickets sueltos + Suma de cortes de usuario)
        const totalPayments = pendingPayments.reduce((acc, p) => acc + Number(p.amount), 0);
        const totalUserCuts = userCuts.reduce((acc, c) => acc + Number(c.total_reported), 0);
        const finalTotal = totalPayments + totalUserCuts;

        // 4. Creamos el registro del Corte General
        const generalClosing = await db.CashCut.create({
            branch_id,
            user_id: supervisor_id,
            total_expected: finalTotal,
            total_reported: finalTotal,
            type: 'GENERAL',
            status: 'CLOSED'
        });

        // 5. VINCULACIÓN:
        // A. A los tickets sueltos les ponemos el ID del corte general
        if (pendingPayments.length > 0) {
            await db.Payment.update(
                { cash_closing_id: generalClosing.cut_id },
                { where: { payment_id: pendingPayments.map(p => p.payment_id) } }
            );
        }

        // B. A los cortes de usuario les ponemos el ID del corte general (parent_cut_id)
        if (userCuts.length > 0) {
            await db.CashCut.update(
                { parent_cut_id: generalClosing.cut_id },
                { where: { cut_id: userCuts.map(c => c.cut_id) } }
            );
        }

        res.status(201).json({ 
            message: "Corte General completado exitosamente", 
            total: finalTotal,
            ticketsCerrados: pendingPayments.length,
            cortesUsuariosCerrados: userCuts.length
        });

    } catch (e) {
        console.error("Error en General Closing:", e);
        res.status(500).json({ error: e.message });
    }
};