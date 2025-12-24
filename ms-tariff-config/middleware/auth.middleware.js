const authClient = require('../clients/auth.client');

exports.verifyJWT = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'No autenticado. Token requerido.' });
    }

    try {
        const payload = await authClient.verifyToken(token);
        req.user = payload; 
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || 'Token inválido.' });
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