const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

exports.verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. No se proporcionó Token.' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        
        req.user = payload; 
        
        next();
    } catch (error) {
        console.error("Error al verificar token:", error.message);
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};