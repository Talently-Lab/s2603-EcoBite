
const pool = require('../db');

// Registrar un horario para un restaurante, día y turno
async function crear(idRestaurante, diaSemana, horaApertura, horaCierre) {
    const consulta = `
        INSERT INTO horario_restaurante (
            id_restaurante,
            dia_semana,
            hora_apertura,
            hora_cierre
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const valores = [
        idRestaurante,
        diaSemana,
        horaApertura,
        horaCierre
    ];

    const resultado = await pool.query(consulta, valores);

    return resultado.rows[0];
}

// Consultar todos los horarios de un restaurante
async function obtenerPorRestaurante(idRestaurante) {
    const consulta = `
        SELECT *
        FROM horario_restaurante
        WHERE id_restaurante = $1
        ORDER BY dia_semana, hora_apertura;
    `;

    const resultado = await pool.query(consulta, [idRestaurante]);

    return resultado.rows;
}

//obtiene dueño de restaurante
async function obtenerRestaurante(idRestaurante) {
    const consulta = `
        SELECT id, id_usuario
        FROM restaurante
        WHERE id = $1;
    `;
    const resultado = await pool.query(consulta, [idRestaurante]);

    return resultado.rows[0] || null;
}

//reemplazar todos los horarios de un restaurante
async function reemplazarPorRestaurante(idRestaurante, horarios) {
    const conexion = await pool.connect();

    try {
        await conexion.query('BEGIN');

        await conexion.query(
            'DELETE FROM horario_restaurante WHERE id_restaurante = $1',
            [idRestaurante]
        );

        const horariosGuardados = [];

        for (const horario of horarios) {
            const consulta = `
                INSERT INTO horario_restaurante (
                    id_restaurante,
                    dia_semana,
                    hora_apertura,
                    hora_cierre
                )
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;

            const valores = [
                idRestaurante,
                horario.dia_semana,
                horario.hora_apertura,
                horario.hora_cierre
            ];

            const resultado = await conexion.query(consulta, valores);
            horariosGuardados.push(resultado.rows[0]);
        }

        await conexion.query('COMMIT');

        return horariosGuardados;
    } catch (error) {
        await conexion.query('ROLLBACK');
        throw error;
    } finally {
        conexion.release();
    }
}


 // Modificar un turno específico
async function actualizar(idRestaurante, idHorario, diaSemana, horaApertura, horaCierre) {
    const consulta = `
        UPDATE horario_restaurante
        SET dia_semana = $3,
            hora_apertura = $4,
            hora_cierre = $5
        WHERE id_restaurante = $1
          AND id = $2
        RETURNING *;
    `;

    const valores = [
        idRestaurante,
        idHorario,
        diaSemana,
        horaApertura,
        horaCierre
    ];

    const resultado = await pool.query(consulta, valores);
    return resultado.rows[0] || null;
}

// Eliminar un turno específico
async function eliminar(idRestaurante, idHorario) {
    const consulta = `
        DELETE FROM horario_restaurante
        WHERE id_restaurante = $1
          AND id = $2
        RETURNING *;
    `;

    const resultado = await pool.query(consulta, [
        idRestaurante,
        idHorario
    ]);

    return resultado.rows[0] || null;
}


async function agregarTurno(idRestaurante, diaSemana, horaApertura, horaCierre) {
    const consulta = `
        INSERT INTO horario_restaurante (
            id_restaurante,
            dia_semana,
            hora_apertura,
            hora_cierre
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const valores = [
        idRestaurante,
        diaSemana,
        horaApertura,
        horaCierre
    ];

    const resultado = await pool.query(consulta, valores);
    return resultado.rows[0];
}



//Funcion para abierto y cerrado
async function obtenerEstadoRestaurante(idRestaurante) {
    // Obtener el día y la hora actual de San Luis, Argentina
    const ahora = new Date();

    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Argentina/San_Luis',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(ahora);

    const obtenerParte = (tipo) => partes.find(parte => parte.type === tipo).value;

    const dias = {
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
        Sun: 7
    };

    const diaSemana = dias[obtenerParte('weekday')];

    const horaActual = Number(obtenerParte('hour')) * 3600 + Number(obtenerParte('minute')) * 60 +
                       Number(obtenerParte('second'));

    // Consultar los horarios correspondientes a hoy
    const consulta = `
        SELECT hora_apertura, hora_cierre
        FROM horario_restaurante
        WHERE id_restaurante = $1
          AND dia_semana = $2
        ORDER BY hora_apertura;
    `;

    const resultado = await pool.query(consulta, [
        idRestaurante,
        diaSemana
    ]);

    const horarios = resultado.rows;

    // Si no hay horarios hoy, el restaurante está cerrado
    const abierto = horarios.some(horario => {
        const [horaApertura, minutoApertura] = String(horario.hora_apertura).slice(0, 5).split(':').map(Number);

        const [horaCierre, minutoCierre] = String(horario.hora_cierre).slice(0, 5).split(':').map(Number);

        const apertura = horaApertura * 3600 + minutoApertura * 60;
        const cierre = horaCierre * 3600 + minutoCierre * 60;

        return horaActual >= apertura && horaActual < cierre + 60;
    });

    return {
        abierto,
        dia_semana: diaSemana,
        hora_actual: `${obtenerParte('hour')}:${obtenerParte('minute')}`
    };
}

module.exports = {
    crear,
    obtenerPorRestaurante,
    obtenerRestaurante,
    reemplazarPorRestaurante,
    obtenerEstadoRestaurante,
    actualizar,
    eliminar,
    agregarTurno
};
