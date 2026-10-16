// ==========================================
// MODELO DE CLIENTE
// Operaciones sobre la tabla usuario
// ==========================================
const pool = require('../db');

// CREAR PERFIL DE CLIENTE
async function crear(cliente) {
    const {
        id_usuario,
        nombre,
        apellido,
        telefono,
        direccion,
        piso,
        departamento,
        ciudad,
        id_zona
    } = cliente;

    // Validar los datos obligatorios
    if (!id_usuario || !nombre || !apellido) {
        throw new Error('Faltan datos obligatorios para el cliente');
    }

    // Verificar que la cuenta pertenezca a un cliente
    const usuario = await pool.query(
        'SELECT rol FROM usuario WHERE id = $1',
        [id_usuario]
    );

    if (usuario.rows.length === 0) {
        throw new Error('El usuario no existe');
    }

    if (usuario.rows[0].rol !== 'cliente') {
        throw new Error('Solo los usuarios con rol cliente pueden crear un perfil de cliente');
    }


    const resultado = await pool.query(
        `INSERT INTO cliente
            (id_usuario, nombre, apellido, telefono, direccion,
             piso, departamento, ciudad, id_zona)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
            id_usuario,
            nombre,
            apellido,
            telefono || null,
            direccion || null,
            piso || null,
            departamento || null,
            ciudad || null,
            id_zona || null
        ]
    );

    return resultado.rows[0];
}

// OBTENER TODOS LOS CLIENTES
async function obtenerTodos() {
    const resultado = await pool.query(
        'SELECT * FROM cliente ORDER BY id'
    );

    return resultado.rows;
}

// OBTENER UN CLIENTE POR ID
async function obtenerPorId(id) {
    const resultado = await pool.query(
        'SELECT * FROM cliente WHERE id = $1',
        [id]
    );

    return resultado.rows[0] || null;
}

// ACTUALIZAR PERFIL DE CLIENTE
async function actualizar(id, datos) {
    const {
        nombre,
        apellido,
        telefono,
        direccion,
        piso,
        departamento,
        ciudad,
        id_zona
    } = datos;

    // Validar los datos obligatorios
    if ( nombre === '' || apellido === '' ) {
        throw new Error('El nombre y el apellido no pueden estar vacíos');
    }

    // Preparar los campos que se van a actualizar
    const resultado = await pool.query(
        `UPDATE cliente
         SET nombre = COALESCE($1, nombre),
             apellido = COALESCE($2, apellido),
             telefono = COALESCE($3, telefono),
             direccion = COALESCE($4, direccion),
             piso = COALESCE($5, piso),
             departamento = COALESCE($6, departamento),
             ciudad = COALESCE($7, ciudad),
             id_zona = $8
         WHERE id = $9
         RETURNING *`,
        [
            nombre ?? null,
            apellido ?? null,
            telefono ?? null,
            direccion ?? null,
            piso ?? null,
            departamento ?? null,
            ciudad ?? null,
            id_zona === undefined ? null : id_zona,
            id
        ]
    );

    return resultado.rows[0] || null;
}


 // ELIMINAR PERFIL DE CLIENTE
async function eliminar(id) {
    const resultado = await pool.query(
        `DELETE FROM cliente
         WHERE id = $1
         RETURNING id, id_usuario, nombre, apellido`,
        [id]
    );

    return resultado.rows[0] || null;
}


module.exports = {
    crear,
    obtenerTodos,
    obtenerPorId,
    actualizar,
    eliminar
};
