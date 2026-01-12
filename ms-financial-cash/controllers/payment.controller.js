const db = require('../models');
const financialService = require('../services/financial.service');

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
        console.log("🔎 Buscando resumen para sucursal:", branchId);

        // Paso a paso para detectar dónde truena
        if (!db.Payment) {
            console.error("❌ ERROR: El modelo db.Payment no está cargado.");
            return res.status(500).json({ error: "Modelo Payment no encontrado" });
        }

        const pending = await db.Payment.findAll({
            where: { 
                branch_id: branchId, 
                cash_closing_id: null 
            }
        });

        console.log(`✅ Se encontraron ${pending.length} transacciones.`);

        const total_cash = pending
            .filter(p => p.method === 'CASH')
            .reduce((acc, p) => acc + Number(p.amount), 0);

        const total_card = pending
            .filter(p => p.method === 'CARD')
            .reduce((acc, p) => acc + Number(p.amount), 0);

        res.json({ 
            total: total_cash + total_card, 
            total_cash, 
            total_card, 
            count: pending.length 
        });
    } catch (e) {
        // ESTO ES LO QUE NECESITAMOS VER EN EL LOG:
        console.error("🔥 Error crítico en getPendingSummary:", e); 
        res.status(500).json({ error: e.message, stack: e.stack });
    }
};

exports.createGeneralClosing = async (req, res) => {
    try {
        const { branch_id } = req.body;
        const supervisor_id = req.user.user_id;

        // 1. Buscar transacciones pendientes
        const transactions = await db.Payment.findAll({
            where: {
                branch_id,
                cash_closing_id: null
            }
        });

        if (transactions.length === 0) {
            return res.status(400).json({ message: "No hay transacciones pendientes para corte." });
        }

        const total = transactions.reduce((acc, p) => acc + Number(p.amount), 0);

        // 2. CORRECCIÓN: Usar db.CashCut (que es tu modelo único)
        const closing = await db.CashCut.create({
            branch_id,
            user_id: supervisor_id, // Evita el error NOT NULL
            total_expected: total,
            total_reported: total,
            difference: 0,
            type: 'GENERAL', // Aquí aplicamos tu ENUM
            status: 'CLOSED'
        });

        // 3. Vincular transacciones al ID del corte
        // Nota: Si tu modelo CashCut usa 'cut_id' como PK, usa closing.cut_id
        await db.Payment.update(
            { cash_closing_id: closing.cut_id }, 
            { where: { payment_id: transactions.map(t => t.payment_id) } }
        );

        res.status(201).json({ 
            message: "Corte general realizado exitosamente", 
            closing 
        });
    } catch (error) {
        console.error("🔥 Error en createGeneralClosing:", error);
        res.status(500).json({ error: error.message });
    }
};