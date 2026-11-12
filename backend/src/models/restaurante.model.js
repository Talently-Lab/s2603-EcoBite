// ==========================================
// MODELO DE RESTAURANTE
// Operaciones sobre la tabla restaurante
// ==========================================

const pool = require('../db');//require() trae algo de un archivo; ..→ subir una carpeta, de models a src/db → entrar al archivo db.js
const { validarTexto,validarTelefono,validarUrlImagen } = require('../utils/validaciones');

//OBTENER TODOS LOS RESTAURANTES CON SUS HORARIOS
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
    /* if (!id_usuario || !nombre || !cuit || !categoria) {
        throw new Error('Faltan datos obligatorios para el restaurante');
    } */

    // Validar campos obligatorios
    const nombreValidado = validarTexto(nombre, 'El nombre', {minimo: 3,maximo: 150,obligatorio: true});
    const telefonoValidado = validarTelefono(telefono);
    const direccionValidada = validarTexto(direccion, 'La dirección', {minimo: 5,maximo: 255,obligatorio: true});
    const categoriaValidada = validarTexto(categoria, 'La categoría', {maximo: 100, obligatorio: true});
    const imagenValidada = validarTexto(imagen, 'La imagen', { maximo: 255, obligatorio: true});

    // Validar campos opcionales
    const descripcionValidada = validarTexto(descripcion, 'La descripción');
    const ciudadValidada = validarTexto(ciudad, 'La ciudad', { maximo: 100 });

    // Validar CUIT
    if (typeof cuit !== 'string' || !/^\d{11}$/.test(cuit)) {
        throw new Error('El CUIT debe tener exactamente 11 números, sin guiones');
    }

    if (!id_usuario) {
        throw new Error('Falta el usuario del restaurante');
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
            nombreValidado,
            telefonoValidado,
            cuit,
            direccionValidada,
            descripcionValidada,
            categoriaValidada,
            ciudadValidada,
            imagenValidada
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

     // Validar campos si se envían para modificar
    const nombreValidado = nombre === undefined ? null : validarTexto(nombre, 'El nombre', {
            minimo: 3,
            maximo: 150,
            obligatorio: true
        });

    const telefonoValidado = telefono === undefined ? null : validarTelefono(telefono);

    // Validar CUIT si se envía
    let cuitValidado = null;

    if (cuit !== undefined) {
        if (typeof cuit !== 'string' || !/^\d{11}$/.test(cuit)) {
            throw new Error('El CUIT debe tener exactamente 11 números, sin guiones');
        }
        cuitValidado = cuit;
    }

    const direccionValidada = direccion === undefined ? null : validarTexto(direccion, 'La dirección', {
            minimo: 5,
            maximo: 255,
            obligatorio: true
        });

    const descripcionValidada = descripcion === undefined ? null : validarTexto(descripcion, 'La descripción');

    const categoriaValidada = categoria === undefined ? null : validarTexto(categoria, 'La categoría', {
            maximo: 100,
            obligatorio: true
        });

    const ciudadValidada = ciudad === undefined ? null : validarTexto(ciudad, 'La ciudad', {
            maximo: 100
        });

    const imagenValidada = imagen === undefined ? null : validarTexto(imagen, 'La imagen', {
            maximo: 255,
            obligatorio: true
        });

    //Actualizar restaurante
    const resultado = await pool.query(
        `UPDATE restaurante
         SET nombre = COALESCE($1, nombre),
             telefono = COALESCE($2, telefono),
             cuit = COALESCE($3, cuit),
             direccion = COALESCE($4, direccion),
             descripcion = COALESCE($5, descripcion),
             categoria = COALESCE($6, categoria),
             ciudad = COALESCE($7, ciudad),
             imagen = COALESCE($8, imagen)
         WHERE id = $9
         RETURNING *`,
        [
            nombreValidado,
            telefonoValidado,
            cuitValidado,
            direccionValidada,
            descripcionValidada,
            categoriaValidada,
            ciudadValidada,
            imagenValidada,
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

async function actualizarImagen(id, imagen) {
    
    const imagenValidada = validarUrlImagen(imagen);
    const resultado = await pool.query(
        `UPDATE restaurante
         SET imagen = $2
         WHERE id = $1
         RETURNING *`,
        [id, imagenValidada]
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