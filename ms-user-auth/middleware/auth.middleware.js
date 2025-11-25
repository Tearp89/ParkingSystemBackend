
const axios = require('axios'); 
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3002/api/v1/auth';

exports.verifyJWT = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. No se proporcionó Token.' });
    }

    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/verify`, { token });
        
        req.user = response.data.payload; 
        
        next();
    } catch (error) {
        console.error("Error al verificar token con MS-AUTH:", error.response ? error.response.data : error.message);
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};