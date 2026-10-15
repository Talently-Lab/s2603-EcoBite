// ==========================================
// MODELO DE USUARIO
// Operaciones sobre la tabla usuario
// ==========================================
const pool = require('../db');
const bcrypt = require('bcrypt');//para hash contraseña

//CREAR USUARIO-CLIENTE
async function crearCliente(usuario) {
    const {
        email,
        contrasena,
        avatar,
        canal_adquisicion
    } = usuario;

    // Validamos los datos obligatorios
    if (!email || !contrasena || !canal_adquisicion) {
        throw new Error('Faltan datos obligatorios');
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const resultado = await pool.query(
        `INSERT INTO usuario
            (email, contrasena, avatar, rol, canal_adquisicion)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, avatar, rol, fecha_registro, canal_adquisicion`,
        [
            email,
            contrasenaHash,
            avatar || null,
            'cliente',
            canal_adquisicion
        ]
    );

    return resultado.rows[0];
}

//CREACION USUARIO-RESTAURANTE
async function crearRestaurante(usuario) {
    const {
        email,
        contrasena,
        avatar,
        canal_adquisicion
    } = usuario;

    // Validamos los datos obligatorios
    if (!email || !contrasena || !canal_adquisicion) {
        throw new Error('Faltan datos obligatorios');
    }

    // Protegemos la contraseña
    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const resultado = await pool.query(
        `INSERT INTO usuario
            (email, contrasena, avatar, rol, canal_adquisicion)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, avatar, rol, fecha_registro, canal_adquisicion`,
        [
            email,
            contrasenaHash,
            avatar || null,
            'restaurante',
            canal_adquisicion
        ]
    );

    return resultado.rows[0];
}

//===========LOGIN============
// OBTENER UN USUARIO POR EMAIL (para el login)
async function obtenerPorEmail(email) {
    const resultado = await pool.query(
        `SELECT id, email, contrasena, rol
         FROM usuario
         WHERE email = $1`,
        [email]
    );

    return resultado.rows[0] || null;
}


//OBTENER TODOS LOS USUARIOS
async function obtenerTodos() {
    const resultado = await pool.query(
        'SELECT id, email, avatar, rol, fecha_registro FROM usuario'
    );

    return resultado.rows;
}

//OBTENER UN USUARIO
async function obtenerPorId(id) {
    const resultado = await pool.query(
        `SELECT id, email, avatar, rol, fecha_registro
         FROM usuario
         WHERE id = $1`,
        [id]
    );

    return resultado.rows[0] || null;
}

//MODIFICAR USUARIO
async function actualizar(id, datos) {
    const campos = [];
    const valores = [];

    // Actualizar email si fue enviado
    if (datos.email !== undefined) {
        if (typeof datos.email !== 'string' || !datos.email.trim()) {
            throw new Error('El email no puede estar vacío');
        }

        valores.push(datos.email.trim());
        campos.push(`email = $${valores.length}`);
    }

    // Actualizar contraseña si fue enviada
    if (datos.contrasena !== undefined) {
        if (typeof datos.contrasena !== 'string' || !datos.contrasena.trim()) {
            throw new Error('La contraseña no puede estar vacía');
        }

        const contrasenaHash = await bcrypt.hash(datos.contrasena, 10);

        valores.push(contrasenaHash);
        campos.push(`contrasena = $${valores.length}`);
    }

    // Actualizar avatar si fue enviado
    if (datos.avatar !== undefined) {
        valores.push(datos.avatar);
        campos.push(`avatar = $${valores.length}`);
    }

    // No permitir una actualización vacía
    if (campos.length === 0) {
        throw new Error('No se enviaron campos para modificar');
    }

    valores.push(id);

    const resultado = await pool.query(
        `UPDATE usuario
         SET ${campos.join(', ')}
         WHERE id = $${valores.length}
         RETURNING id, email, avatar, rol, fecha_registro, canal_adquisicion`,
        valores
    );

    return resultado.rows[0] || null;
}

//ELIMINAR UN USUARIO
async function eliminar(id) {
    const resultado = await pool.query(
        `DELETE FROM usuario
         WHERE id = $1
         RETURNING id, email, avatar, rol`,
        [id]
    );

    return resultado.rows[0] || null;
}



module.exports = {
    crearCliente,
    crearRestaurante,
    obtenerTodos,
    obtenerPorEmail,
    obtenerPorId,
    actualizar,
    eliminar
};