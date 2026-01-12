
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserModel = db.User;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; 

class AuthService {

    async register(userData) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const newUser = await UserModel.create({
            username: userData.username,
            password_hash: hashedPassword, 
            role: userData.role,
            name: userData.name,
            branch_id: userData.branch_id || null
        });

        const { password_hash, ...userWithoutPassword } = newUser.toJSON();
        return userWithoutPassword;
    }
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

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }); 
        
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

    /**
     * Recupera todos los usuarios registrados.
     * @returns {Promise<Array>} Lista de usuarios.
     */
    async getAllUsers() {
        return await UserModel.findAll({
            attributes: { exclude: ['password_hash'] }
        });
    }

    async getUserById(userId) {
        const user = await UserModel.findByPk(userId, {
            attributes: { exclude: ['password_hash'] } 
        });
        
        if (!user) {
            throw new Error('Usuario no encontrado.');
        }
        return user;
    }

  

async deleteUser(userId) {
    const user = await UserModel.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');
    
    user.active = false; 
    return await user.save();
}
}



module.exports = new AuthService();