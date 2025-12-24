const axios = require('axios');

// URL del microservicio de autenticación (ajústala si usas otro puerto)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3002/api/v1/auth';

exports.verifyJWT = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        // Llamada síncrona al microservicio de usuarios para validar el token
        const response = await axios.post(`${AUTH_SERVICE_URL}/verify`, { token });
        req.user = response.data.payload;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o servicio de auth caído' });
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