// ==========================================
// CONEXIÓN A POSTGRESQL
// Configuración y creación del pool de conexiones
// ==========================================

//dotenv es una librería de Node.js que lee las variables guardadas en el archivo .env.
// require('dotenv') carga esa librería.//.config() ejecuta su función de configuración, que lee el archivo .env y carga sus variables en process.env.
require('dotenv').config();

/*pg: Es un paquete/librería que nos proporciona herramientas para conectarnos y hacer consultas a PostgreSQL desde Node.js.
"De la librería pg, necesito la herramienta llamada Pool." Los { } son desestructuración */
const { Pool } = require('pg');

//Creamos una instancia de la clase Pool que contiene las opciones de configuración de la conexion que esta en .env
//usamos el nombre pool = administrador de conexiones con PostgreSQL.
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

//exportamos el modulo pool para importarlo en los models
module.exports = pool;