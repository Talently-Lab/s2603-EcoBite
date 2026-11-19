// ==========================================
// CONEXIÓN A POSTGRESQL
// Configuración y creación del pool de conexiones
// ==========================================

require('dotenv').config();

const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL
    })
    : new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

//exportamos el modulo pool para importarlo en los models
module.exports = pool;