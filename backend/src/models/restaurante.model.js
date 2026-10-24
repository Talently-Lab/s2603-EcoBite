// ==========================================
// MODELO DE RESTAURANTE
// Operaciones sobre la tabla restaurante
// ==========================================

const pool = require('../db');//require() trae algo de un archivo; ..→ subir una carpeta, de models a src/db → entrar al archivo db.js

//OBTENER TODOS LOS RESTAURANTES CON SUS HORARIOS
/* async function obtenerTodos() {
    const resultado = await pool.query(
        'SELECT * FROM restaurante'
    );
    return resultado.rows;
} */
async function obtenerTodos() {
    const resultado = await pool.query(
        `SELECT r.*,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'dia_semana', h.dia_semana,
                            'hora_apertura', h.hora_apertura,
                            'hora_cierre', h.hora_cierre
                        )
                        ORDER BY h.dia_semana
                    )
                    FROM horario_restaurante h
                    WHERE h.id_restaurante = r.id
                ),
                '[]'::json
            ) AS horarios
        FROM restaurante r
        ORDER BY r.id`
    );

    return resultado.rows;
}

//OBTENER UN RESTAURANTE ESPECIFICO
/* async function obtenerPorId(id) {
    const resultado = await pool.query(
        'SELECT * FROM restaurante WHERE id = $1',
        [id]
    );
    return resultado.rows[0] || null;
} */
async function obtenerPorId(id) {
    const resultado = await pool.query(
        `SELECT r.*,
            COALESCE(
                (SELECT json_agg(
                    json_build_object(
                        'dia_semana', h.dia_semana,
                        'hora_apertura', h.hora_apertura,
                        'hora_cierre', h.hora_cierre
                    )
                    ORDER BY h.dia_semana
                )
                    FROM horario_restaurante h
                    WHERE h.id_restaurante = r.id
                ),
                '[]'::json
            ) AS horarios
        FROM restaurante r
        WHERE r.id = $1`,
        [id]
    );
    return resultado.rows[0] || null;
}

//CREAR RESTAURANTE
async function crear(restaurante) {//recibe un objeto restaurante
    //desestructuración: extraemos las propiedades del objeto para utilizarlas individualmente.
    const {
        id_usuario,
        nombre,
        telefono,
        cuit,
        direccion,
        descripcion,
        categoria,
        ciudad,
        imagen
    } = restaurante;

    // Validar los datos obligatorios
    if (
        !id_usuario ||
        !nombre ||
        !cuit ||
        !categoria
    ) {
        throw new Error('Faltan datos obligatorios para el restaurante');
    }

    // Verificar que la cuenta exista
    const usuario = await pool.query(
        'SELECT rol FROM usuario WHERE id = $1',
        [id_usuario]
    );

    if (usuario.rows.length === 0) {
        throw new Error('El usuario no existe');
    }

    // Verificar que la cuenta tenga el rol correcto
    if (usuario.rows[0].rol !== 'restaurante') {
        throw new Error(
            'Solo los usuarios con rol restaurante pueden crear un perfil de restaurante'
        );
    }

    // Insertar el restaurante en la base de datos
    const resultado = await pool.query(
        `INSERT INTO restaurante
        (id_usuario, nombre, telefono, cuit, direccion, descripcion, categoria, ciudad, imagen)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
            id_usuario,
            nombre,
            telefono || null,
            cuit,
            direccion || null,
            descripcion || null,
            categoria,
            ciudad || null,
            imagen || null
        ]
    );
    // Devolver el restaurante creado
    return resultado.rows[0];
}

//ACTUALIZAR RESTAURANTE
async function actualizar(id, restaurante) {
    const {
        nombre,
        telefono,
        cuit,
        direccion,
        descripcion,
        categoria,
        ciudad,
        imagen
    } = restaurante;

    const resultado = await pool.query(
        `UPDATE restaurante
         SET nombre = $1,
             telefono = $2,
             cuit = $3,
             direccion = $4,
             descripcion = $5,
             categoria = $6,
             ciudad = $7,
             imagen = $8
         WHERE id = $9
         RETURNING *`,
        [
            nombre,
            telefono,
            cuit,
            direccion,
            descripcion,
            categoria,
            ciudad,
            imagen,
            id
        ]
    );

    return resultado.rows[0] || null;
}

//ELIMINAR RESTAURANTE
async function eliminar(id) {
    const resultado = await pool.query(
        `DELETE FROM restaurante
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return resultado.rows[0] || null;
}

//prueba
async function actualizarImagen(id, imagen) {
    const resultado = await pool.query(
        `UPDATE restaurante
         SET imagen = $2
         WHERE id = $1
         RETURNING *`,
        [id, imagen]
    );

    return resultado.rows[0] || null;
}

//FILTROS
async function obtenerPorCategoria(categoria) {
    const resultado = await pool.query(
        `SELECT r.*,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'dia_semana', h.dia_semana,
                            'hora_apertura', h.hora_apertura,
                            'hora_cierre', h.hora_cierre
                        )
                        ORDER BY h.dia_semana
                    )
                    FROM horario_restaurante h
                    WHERE h.id_restaurante = r.id
                ),
                '[]'::json
            ) AS horarios
        FROM restaurante r
        WHERE LOWER(r.categoria) = LOWER($1)
        ORDER BY r.id`,
        [categoria]
    );

    return resultado.rows;
}


//Exportamos los modulos: permite que otros archivos del backend,como server.js utilicen estas funciones.
module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizar,
    actualizarImagen,
    eliminar,
    obtenerPorCategoria
};