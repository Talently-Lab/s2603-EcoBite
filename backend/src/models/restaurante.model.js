const pool = require('../db');

async function obtenerTodos() {
    const resultado = await pool.query(
        'SELECT * FROM restaurante'
    );

    return resultado.rows;
}

async function obtenerPorId(id) {
    const resultado = await pool.query(
        'SELECT * FROM restaurante WHERE id = $1',
        [id]
    );

    return resultado.rows[0] || null;
}
//permite que otros archivos del backend utilicen estas funciones.
module.exports = {
    obtenerTodos,
    obtenerPorId,
};