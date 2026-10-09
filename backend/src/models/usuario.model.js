
const pool = require('../db');

async function obtenerTodos() {
    const resultado = await pool.query(
        'SELECT id, email, avatar, rol, fecha_registro FROM usuario'
    );

    return resultado.rows;
}

async function obtenerPorId(id) {
    const resultado = await pool.query(
        `SELECT id, email, avatar, rol, fecha_registro
         FROM usuario
         WHERE id = $1`,
        [id]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
};