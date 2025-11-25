/**
 * Middleware que verifica si el usuario autenticado tiene alguno de los roles permitidos.
 * @param {...string} allowedRoles Roles permitidos (ej. 'ADMIN', 'SUPERVISOR')
 */
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'No se pudo obtener el rol del usuario.' });
        }

        const userRole = req.user.role;
        
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            return res.status(403).json({ 
                message: `Permiso denegado. Rol ${userRole} no autorizado para esta operación.`
            });
        }
    };
};