
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserModel = db.User;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; // Usar .env

class AuthService {
    /**
     * Valida credenciales y genera un JWT (CU-16: Autenticación).
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<string>} Token JWT
     */
    async login(username, password) {
        const user = await UserModel.findOne({ where: { username, active: true } });
        if (!user) {
            throw new Error('Credenciales inválidas.');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Credenciales inválidas.');
        }
        
        const payload = {
            user_id: user.user_id,
            role: user.role,
            branch_id: user.branch_id,
            name: user.name
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }); // Token expira en 8 horas
        
        return token;
    }

    /**
     * Verifica la validez y autenticidad de un JWT.
     * @param {string} token 
     * @returns {object} Payload decodificado si es válido.
     */
    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Token inválido o expirado.');
        }
    }

    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
}

module.exports = new AuthService();