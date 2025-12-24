
const authService = require('../services/auth.service');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Se requiere usuario y contraseña.' });
    }

    try {
        const token = await authService.login(username, password);
        return res.status(200).json({ token, message: 'Autenticación exitosa.' });
    } catch (error) {
        return res.status(401).json({ message: error.message || 'Error de autenticación.' });
    }
};

exports.verifyToken = async (req, res) => {
    const token = req.body.token || req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado.' });
    }

    try {
        const payload = authService.verifyToken(token);
        return res.status(200).json({ message: 'Token válido', payload });
    } catch (error) {
        return res.status(401).json({ message: error.message || 'Token inválido.' });
    }
};

// ms-user-auth/controllers/auth.controller.js
exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ message: 'Usuario creado con éxito', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};