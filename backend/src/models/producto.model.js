const pool = require('../db');
const { validarTexto,validarPrecio,validarUrlImagen, ErrorValidacion } = require('../utils/validaciones');

// Obtener todos los productos disponible de un restaurante y opcional por categoria
async function obtenerPorRestaurante(idRestaurante, categoria=null) {
    const resultado = await pool.query(
        `SELECT *
         FROM producto
         WHERE id_restaurante = $1
         AND disponible = TRUE
         AND ($2::text IS NULL OR LOWER(categoria) = LOWER($2))
         ORDER BY id`,
        [idRestaurante,categoria]
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

     // Validar restaurante
    if (!Number.isInteger(Number(id_restaurante)) || Number(id_restaurante) <= 0) {
        throw new ErrorValidacion('El restaurante seleccionado no es válido');
    }

    const restaurante = await pool.query(
        'SELECT id FROM restaurante WHERE id = $1',
        [Number(id_restaurante)]
    );

    if (restaurante.rows.length === 0) {
        throw new ErrorValidacion('El restaurante seleccionado no existe');
    }

    // Validar campos obligatorios
    const nombreValidado = validarTexto(nombre, 'El nombre', {
        minimo: 3,
        maximo: 150,
        obligatorio: true
    });

    const precioValidado = validarPrecio(precio);

    const categoriaValidada = validarTexto(categoria, 'La categoría', {
        minimo: 1,
        maximo: 100,
        obligatorio: true
    });

    // Validar campos opcionales
    const descripcionValidada = validarTexto(descripcion, 'La descripción');

    const imagenValidada = imagen === undefined || imagen === null || imagen === ''
        ? null
        : validarUrlImagen(imagen);


    const resultado = await pool.query(
        `INSERT INTO producto
            (id_restaurante, nombre, descripcion, precio, categoria, imagen)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            Number(id_restaurante),
            nombreValidado,
            descripcionValidada,
            precioValidado,
            categoriaValidada,
            imagenValidada
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
        disponible,
        imagen
    } = datos;

    // Validar nombre si fue enviado
    const nombreValidado = nombre === undefined
        ? null
        : validarTexto(nombre, 'El nombre', {
            minimo: 3,
            maximo: 150,
            obligatorio: true
        });

    // Validar descripción si fue enviada
    const descripcionValidada = descripcion === undefined
        ? null
        : validarTexto(descripcion, 'La descripción',{
            minimo: 3,
            maximo: 150,
            obligatorio:false
        });

    // Validar precio si fue enviado
    const precioValidado = precio === undefined
        ? null
        : validarPrecio(precio);

    // Validar categoría si fue enviada
    const categoriaValidada = categoria === undefined
        ? null
        : validarTexto(categoria, 'La categoría', {
            minimo: 3,
            maximo: 100,
            obligatorio: true
        });

    // Validar disponibilidad si fue enviada
    const disponibleValidado = disponible === undefined
        ? null
        : validarDisponible(disponible);

    // Validar imagen si fue enviada
    const imagenValidada = imagen === undefined
        ? null
        : imagen === null || imagen === ''
            ? null
            : validarUrlImagen(imagen);

    // Comprobar que exista al menos un campo para modificar
    if (
        nombre === undefined &&
        descripcion === undefined &&
        precio === undefined &&
        categoria === undefined &&
        disponible === undefined &&
        imagen === undefined
    ) {
        throw new ErrorValidacion('No se enviaron campos para modificar');
    }

    const resultado = await pool.query(
        `UPDATE producto
         SET nombre = COALESCE($2, nombre),
             descripcion = COALESCE($3, descripcion),
             precio = COALESCE($4, precio),
             categoria = COALESCE($5, categoria),
             disponible = COALESCE($6, disponible),
             imagen = COALESCE($7, imagen)
         WHERE id = $1
         RETURNING *`,
        [
            id,
            nombreValidado,
            descripcionValidada,
            precioValidado,
            categoriaValidada,
            disponibleValidado,
            imagenValidada
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

//======FILTROS======

// Productos filtrados para la gestión del restaurante, disponibles o no y categoria opcional
async function obtenerFiltradosPorRestaurante(idRestaurante,categoria = null,disponible = null) {
    const resultado = await pool.query(
        `SELECT *
         FROM producto
         WHERE id_restaurante = $1
           AND ($2::text IS NULL OR LOWER(categoria) = LOWER($2))
           AND ($3::boolean IS NULL OR disponible = $3)
         ORDER BY id`,
        [idRestaurante, categoria, disponible]
    );

    return resultado.rows;
}

module.exports = {
    obtenerPorRestaurante,
    obtenerPorId,
    actualizarImagen,
    crear,
    actualizar,
    eliminar,
    obtenerFiltradosPorRestaurante
};
