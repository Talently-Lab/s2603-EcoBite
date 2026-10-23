const pool = require('../db');

// Obtener todos los productos de un restaurante
async function obtenerPorRestaurante(idRestaurante) {
    const resultado = await pool.query(
        `SELECT *
         FROM producto
         WHERE id_restaurante = $1
         ORDER BY id`,
        [idRestaurante]
    );

    return resultado.rows;
}
// Obtener un producto por su ID
async function obtenerPorId(id) {
    const resultado = await pool.query(
        'SELECT * FROM producto WHERE id = $1',
        [id]
    );

    return resultado.rows[0] || null;
}

// Actualizar la imagen de un producto
async function actualizarImagen(id, imagen) {
    const resultado = await pool.query(
        `UPDATE producto
         SET imagen = $2
         WHERE id = $1
         RETURNING id, id_restaurante, nombre, imagen`,
        [id, imagen]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    obtenerPorRestaurante,
    obtenerPorId,
    actualizarImagen
};
