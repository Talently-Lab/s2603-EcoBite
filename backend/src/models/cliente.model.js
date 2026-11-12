// ==========================================
// MODELO DE CLIENTE
// Operaciones sobre la tabla usuario
// ==========================================
const pool = require('../db');
const { validarTexto,validarTelefono, ErrorValidacion } = require('../utils/validaciones');

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

    // Validar campos obligatorios
    const nombreValidado = validarTexto(nombre, 'El nombre', {minimo: 3,maximo: 100,obligatorio: true});
    const apellidoValidado = validarTexto(apellido, 'El apellido', {minimo: 3,maximo: 100,obligatorio: true});
    const telefonoValidado = validarTelefono(telefono);
    const direccionValidada = validarTexto(direccion, 'La dirección', {minimo: 5,maximo: 150, obligatorio: true});

    // Validar campos opcionales
    const pisoValidado = validarTexto(piso, 'El piso', {maximo: 20});
    const departamentoValidado = validarTexto(departamento, 'El departamento', {maximo: 20});
    const ciudadValidada = validarTexto(ciudad, 'La ciudad', {maximo: 100});

    // Validar los datos obligatorios
    /* if (!id_usuario || !nombre || !apellido) {
        throw new Error('Faltan datos obligatorios para el cliente');
    } */

    if (!id_usuario) {
        throw new Error('Falta el usuario del cliente');
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

    //Validacion del id_zona
    if (!Number.isInteger(Number(id_zona)) || Number(id_zona) <= 0) {
        throw new ErrorValidacion('Debés seleccionar una zona válida');
    }
    const zona = await pool.query(
        'SELECT id FROM zona WHERE id = $1',
        [id_zona]
    );
    if (zona.rows.length === 0) {
        throw new ErrorValidacion('La zona seleccionada no existe');
    }

    //Insercion de cliente
    const resultado = await pool.query(
        `INSERT INTO cliente
            (id_usuario, nombre, apellido, telefono, direccion,
             piso, departamento, ciudad, id_zona)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
            id_usuario,
            nombreValidado,
            apellidoValidado,
            telefonoValidado,
            direccionValidada,
            pisoValidado,
            departamentoValidado,
            ciudadValidada,
            Number(id_zona)
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
    /* if ( nombre === '' || apellido === '' ) {
        throw new Error('El nombre y el apellido no pueden estar vacíos');
    } */

    // Validar campos si se envían para modificar
    const nombreValidado = nombre === undefined ? null : validarTexto(nombre, 'El nombre', {
            minimo: 3,
            maximo: 100,
            obligatorio: true
        });

    const apellidoValidado = apellido === undefined ? null : validarTexto(apellido, 'El apellido', {
            minimo: 3,
            maximo: 100,
            obligatorio: true
        });

    const telefonoValidado = telefono === undefined ? null : validarTelefono(telefono);

    const direccionValidada = direccion === undefined ? null : validarTexto(direccion, 'La dirección', {
            minimo: 5,
            maximo: 150,
            obligatorio: true
        });

    const pisoValidado = piso === undefined ? null : validarTexto(piso, 'El piso', { maximo: 20 });

    const departamentoValidado = departamento === undefined ? null : validarTexto(departamento, 'El departamento', { maximo: 20 });

    const ciudadValidada = ciudad === undefined ? null : validarTexto(ciudad, 'La ciudad', { maximo: 100 });

    // Validar zona si se envía
    let zonaValidada = null;

    if (id_zona !== undefined) {
        if (!Number.isInteger(Number(id_zona)) || Number(id_zona) <= 0) {
            throw new Error('Debés seleccionar una zona válida');
        }

        const zona = await pool.query(
            'SELECT id FROM zona WHERE id = $1',
            [Number(id_zona)]
        );

        if (zona.rows.length === 0) {
            throw new Error('La zona seleccionada no existe');
        }
        zonaValidada = Number(id_zona);
    }

    // Actualizar perfil
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
           nombreValidado,
           apellidoValidado,
           telefonoValidado,
           direccionValidada,
           pisoValidado,
           departamentoValidado,
           ciudadValidada,
           zonaValidada,
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
