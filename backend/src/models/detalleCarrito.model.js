const pool = require('../db');

// Obtener los productos de un carrito
async function obtenerPorCarrito(idCarrito) {
    const resultado = await pool.query(
        `SELECT
            dc.id,
            dc.id_carrito,
            dc.id_producto,
            dc.cantidad,
            p.nombre AS nombre_producto,
            p.descripcion,
            p.precio,
            p.imagen,
            p.disponible,
            p.id_restaurante
         FROM detalle_carrito dc
         INNER JOIN producto p ON p.id = dc.id_producto
         WHERE dc.id_carrito = $1
         ORDER BY dc.id`,
        [idCarrito]
    );

    return resultado.rows;
}

// Agregar un producto al carrito o aumentar su cantidad
async function agregarProducto(idCarrito, idProducto, cantidad) {
    const resultado = await pool.query(
        `INSERT INTO detalle_carrito
            (id_carrito, id_producto, cantidad)
         VALUES ($1, $2, $3)
         ON CONFLICT (id_carrito, id_producto)
         DO UPDATE SET
            cantidad = detalle_carrito.cantidad + EXCLUDED.cantidad
         RETURNING *`,
        [idCarrito, idProducto, cantidad]
    );

    return resultado.rows[0];
}

// Modificar la cantidad de un producto
async function actualizarCantidad(idCarrito, idProducto, cantidad) {
    const resultado = await pool.query(
        `UPDATE detalle_carrito
         SET cantidad = $3
         WHERE id_carrito = $1
           AND id_producto = $2
         RETURNING *`,
        [idCarrito, idProducto, cantidad]
    );

    return resultado.rows[0] || null;
}

// Eliminar un producto del carrito
async function eliminarProducto(idCarrito, idProducto) {
    const resultado = await pool.query(
        `DELETE FROM detalle_carrito
         WHERE id_carrito = $1
           AND id_producto = $2
         RETURNING *`,
        [idCarrito, idProducto]
    );

    return resultado.rows[0] || null;
}

// Eliminar todos los productos de un carrito
async function eliminarTodosPorCarrito(idCarrito) {
    const resultado = await pool.query(
        `DELETE FROM detalle_carrito
         WHERE id_carrito = $1`,
        [idCarrito]
    );

    return resultado.rowCount;
}

module.exports = {
    obtenerPorCarrito,
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    eliminarTodosPorCarrito
};
