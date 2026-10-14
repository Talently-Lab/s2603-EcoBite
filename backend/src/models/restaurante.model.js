// ==========================================
// MODELO DE RESTAURANTE
// Operaciones sobre la tabla restaurante
// ==========================================

const pool = require('../db');//require() trae algo de un archivo; ..→ subir una carpeta, de models a src/db → entrar al archivo db.js

//OBTENER TODOS LOS RESTAURANTES
async function obtenerTodos() {
    const resultado = await pool.query(
        'SELECT * FROM restaurante'
    );
    return resultado.rows;
}

//OBTENER UN RESTAURANTE ESPECIFICO
async function obtenerPorId(id) {
    const resultado = await pool.query(
        'SELECT * FROM restaurante WHERE id = $1',
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
        ciudad
    } = restaurante;

  //armamos consulta
    const resultado = await pool.query(
        `INSERT INTO restaurante
        (id_usuario, nombre, telefono, cuit, direccion, descripcion, categoria, ciudad)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
            id_usuario,
            nombre,
            telefono,
            cuit,
            direccion,
            descripcion,
            categoria,
            ciudad
        ]
    );
    //Devolvemos el restaurante que acabamos de insertar.
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
        ciudad
    } = restaurante;

    const resultado = await pool.query(
        `UPDATE restaurante
         SET nombre = $1,
             telefono = $2,
             cuit = $3,
             direccion = $4,
             descripcion = $5,
             categoria = $6,
             ciudad = $7
         WHERE id = $8
         RETURNING *`,
        [
            nombre,
            telefono,
            cuit,
            direccion,
            descripcion,
            categoria,
            ciudad,
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


//Exportamos los modulos: permite que otros archivos del backend,como server.js utilicen estas funciones.
module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};