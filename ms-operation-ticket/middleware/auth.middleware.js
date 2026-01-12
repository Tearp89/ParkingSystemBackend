const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3002/api/v1/auth';
const jwt = require('jsonwebtoken');
exports.verifyJWT = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: 'Token requerido.' });

    try {
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
            return res.status(403).json({ message: 'No tienes permisos para esta acción' });
        }
        next();
    };
};