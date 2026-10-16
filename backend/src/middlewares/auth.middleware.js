
const jwt = require('jsonwebtoken');

// Verificar que la petición tenga un token válido
function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;//lee la cabecera en la que el frontend envía el token.

    // Comprobar que se haya enviado el token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'No se proporcionó un token de acceso'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const datosUsuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Guardar la identidad verificada para la siguiente función
        req.usuario = datosUsuario;

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido o vencido'
        });
    }
}

function verificarRol(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                error: 'No tenés permisos para realizar esta acción'
            });
        }

        next();
    };
}

module.exports = { 
    verificarToken,
    verificarRol
};
