const financialService = require('../services/financial.service');

exports.pay = async (req, res) => {
    try {
        const payment = await financialService.registerPayment(req.body);
        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.cut = async (req, res) => {
    try {
        const { branch_id, reported_amount } = req.body;
        const cut = await financialService.generateCashCut(branch_id, req.user.user_id, reported_amount);
        res.status(201).json(cut);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};