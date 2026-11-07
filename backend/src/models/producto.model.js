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

/* Crear un producto */
async function crear(datos) {
    const {
        id_restaurante,
        nombre,
        descripcion,
        precio,
        categoria,
        imagen
    } = datos;

    const resultado = await pool.query(
        `INSERT INTO producto
            (id_restaurante, nombre, descripcion, precio, categoria, imagen)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            id_restaurante,
            nombre,
            descripcion,
            precio,
            categoria,
            imagen || null
        ]
    );

    return resultado.rows[0];
}

/* Modificar los datos de un producto */
async function actualizar(id, datos) {
    const {
        nombre,
        descripcion,
        precio,
        categoria,
        disponible
    } = datos;

    const resultado = await pool.query(
        `UPDATE producto
         SET nombre = COALESCE($2, nombre),
             descripcion = COALESCE($3, descripcion),
             precio = COALESCE($4, precio),
             categoria = COALESCE($5, categoria),
             disponible = COALESCE($6, disponible)
         WHERE id = $1
         RETURNING *`,
        [
            id,
            nombre ?? null,
            descripcion ?? null,
            precio ?? null,
            categoria ?? null,
            disponible ?? null
        ]
    );

    return resultado.rows[0] || null;
}

/* Desactivar un producto sin borrar su historial */
async function eliminar(id) {
    const resultado = await pool.query(
        `UPDATE producto
         SET disponible = false
         WHERE id = $1
         RETURNING *`,
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
    actualizarImagen,
    crear,
    actualizar,
    eliminar
};
