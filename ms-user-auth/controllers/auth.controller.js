
const authService = require('../services/auth.service');
const db = require('../models');

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

// ms-user-auth/controllers/auth.controller.js

exports.getUsers = async (req, res) => {
    try {
        const users = await authService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error.message);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ms-user-auth/controllers/auth.controller.js
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, username, role, branch_id, email } = req.body;

    try {
        // Ahora esta función ya existirá en el servicio
        const user = await authService.getUserById(id); 
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualización de campos
        user.name = name || user.name;
        user.username = username || user.username;
        user.role = role || user.role;
        user.branch_id = branch_id || user.branch_id;
        user.email = email || user.email;

        await user.save(); // Sequelize persistirá los cambios
        
        res.status(200).json({ 
            message: 'Usuario actualizado con éxito', 
            user 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await authService.deleteUser(id);
        res.status(200).json({ message: 'Usuario dado de baja con éxito' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.checkSystemStatus = async (req, res) => {
    try {
        // Esto ejecutará internamente: SELECT count(*) FROM "User";
        const adminCount = await db.User.count({
            where: { role: 'ADMIN' }
        });

        console.log(`Verificando sistema: ${adminCount} administradores encontrados.`);

        res.status(200).json({ 
            isFirstRun: adminCount === 0 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};