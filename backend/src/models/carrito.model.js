const pool = require('../db');

// Listar los carritos de un cliente
async function listarPorCliente(idCliente) {
    const resultado = await pool.query(
        `SELECT *
         FROM carrito
         WHERE id_cliente = $1
         ORDER BY fecha_actualizacion DESC`,
        [idCliente]
    );

    return resultado.rows;
}

// Crear un carrito para un cliente y restaurante
async function crear(idCliente, idRestaurante) {
    const resultado = await pool.query(
        `INSERT INTO carrito (id_cliente, id_restaurante)
         VALUES ($1, $2)
         RETURNING *`,
        [idCliente, idRestaurante]
    );

    return resultado.rows[0];
}

// Obtener un carrito por su ID
async function obtenerPorId(id) {
    const resultado = await pool.query(
        `SELECT *
         FROM carrito
         WHERE id = $1`,
        [id]
    );

    return resultado.rows[0] || null;
}

// Obtener el carrito pendiente más reciente de un cliente
async function obtenerPendientePorCliente(idCliente) {
    const resultado = await pool.query(
        `SELECT *
         FROM carrito
         WHERE id_cliente = $1
           AND estado = 'pendiente'
         ORDER BY fecha_actualizacion DESC
         LIMIT 1`,
        [idCliente]
    );

    return resultado.rows[0] || null;
}

// Actualizar la fecha de la última modificación
async function actualizarFechaActualizacion(id) {
    const resultado = await pool.query(
        `UPDATE carrito
         SET fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return resultado.rows[0] || null;
}

// Cambiar el estado del carrito
async function actualizarEstado(id, estado) {
    const resultado = await pool.query(
        `UPDATE carrito
         SET estado = $2,
             fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, estado]
    );

    return resultado.rows[0] || null;
}

// Obtener el ID del perfil de cliente a partir del usuario autenticado
async function obtenerIdClientePorUsuario(idUsuario) {
    const resultado = await pool.query(
        `SELECT id
         FROM cliente
         WHERE id_usuario = $1`,
        [idUsuario]
    );

    return resultado.rows[0]?.id || null;
}

async function obtenerPendientePorClienteYRestaurante(idCliente, idRestaurante) {
    const resultado = await pool.query(
        `SELECT *
         FROM carrito
         WHERE id_cliente = $1
           AND id_restaurante = $2
           AND estado = 'pendiente'
         ORDER BY fecha_actualizacion DESC
         LIMIT 1`,
        [idCliente, idRestaurante]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    listarPorCliente,
    crear,
    obtenerPorId,
    obtenerPendientePorCliente,
    actualizarFechaActualizacion,
    actualizarEstado,
    obtenerIdClientePorUsuario,
    obtenerPendientePorClienteYRestaurante
};
