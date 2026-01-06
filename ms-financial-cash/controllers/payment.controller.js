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