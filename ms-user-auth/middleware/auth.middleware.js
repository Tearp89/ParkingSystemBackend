const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

exports.verifyJWT = (req, res, next) => {
    // 1. Extraer el token del encabezado Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. No se proporcionó Token.' });
    }

    try {
        // 2. Verificar localmente el token
        const payload = jwt.verify(token, JWT_SECRET);
        
        // 3. Inyectar el payload en la petición para que el siguiente middleware lo use
        req.user = payload; 
        
        next();
    } catch (error) {
        console.error("Error al verificar token:", error.message);
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};