const authClient = require('../clients/auth.client');

// En ms-tariff/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

exports.verifyJWT = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: 'Token requerido.' });

    try {
        // Validamos directamente con el secreto compartido
        const payload = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = payload; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'No autorizado para esta operación.' });
        }
        next();
    };
};