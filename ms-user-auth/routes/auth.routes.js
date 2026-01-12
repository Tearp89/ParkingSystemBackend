
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.post('/login', authController.login);

router.post('/verify', authController.verifyToken);
router.post('/register', authController.register);
router.get('/users', verifyJWT, authorize('ADMIN'), authController.getUsers);
router.put('/users/:id', verifyJWT, authorize('ADMIN'), authController.updateUser);
router.delete('/users/:id', verifyJWT, authorize('ADMIN'), authController.deleteUser);
router.get('/system-status', authController.checkSystemStatus);
router.get('/users/:id', verifyJWT, authorize('ADMIN', 'SUPERVISOR', 'CASHIER'), authController.getUserById);

module.exports = router;