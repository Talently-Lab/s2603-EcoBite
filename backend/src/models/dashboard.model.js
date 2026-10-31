
const pool = require('../db');

// Obtener el restaurante asociado al usuario autenticado
async function obtenerIdRestaurantePorUsuario(idUsuario) {
    const resultado = await pool.query(
        `SELECT id
         FROM restaurante
         WHERE id_usuario = $1`,
        [idUsuario]
    );

    if (resultado.rows.length === 0) {
        throw new Error('El usuario no tiene un perfil de restaurante');
    }

    return resultado.rows[0].id;
}

// Obtener pedidos recibidos durante el mes seleccionado
async function obtenerPedidosRecibidos(idRestaurante, mes) {
    const resultado = await pool.query(
        `SELECT COUNT(*) AS pedidos_recibidos
         FROM pedido
         WHERE id_restaurante = $1
           AND fecha_creacion >= TO_DATE($2 || '-01', 'YYYY-MM-DD')
           AND fecha_creacion < TO_DATE($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month'`,
        [idRestaurante, mes]
    );

    return resultado.rows[0];
}

// Obtener ventas entregadas durante el mes seleccionado
async function obtenerVentasEntregadas(idRestaurante, mes) {
    const resultado = await pool.query(
        `SELECT COALESCE(SUM(total_pedido), 0) AS ventas_entregadas
         FROM pedido
         WHERE id_restaurante = $1
           AND estado_pedido = 'entregado'
           AND hora_entrega >= TO_DATE($2 || '-01', 'YYYY-MM-DD')
           AND hora_entrega < TO_DATE($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month'`,
        [idRestaurante, mes]
    );

    return resultado.rows[0];
}

// Obtener CO2 ahorrado de pedidos entregados durante el mes
async function obtenerCo2Ahorrado(idRestaurante, mes) {
    const resultado = await pool.query(
        `SELECT COALESCE(SUM(co2_ahorrado), 0) AS co2_total_ahorrado
         FROM pedido
         WHERE id_restaurante = $1
           AND estado_pedido = 'entregado'
           AND hora_entrega >= TO_DATE($2 || '-01', 'YYYY-MM-DD')
           AND hora_entrega < TO_DATE($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month'`,
        [idRestaurante, mes]
    );

    return resultado.rows[0];
}

// Obtener pedidos agrupados por estado durante el mes
async function obtenerPedidosPorEstado(idRestaurante, mes) {
    const resultado = await pool.query(
        `SELECT
            estado_pedido,
            COUNT(*) AS cantidad_pedidos
         FROM pedido
         WHERE id_restaurante = $1
           AND fecha_creacion >= TO_DATE($2 || '-01', 'YYYY-MM-DD')
           AND fecha_creacion < TO_DATE($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month'
         GROUP BY estado_pedido
         ORDER BY cantidad_pedidos DESC`,
        [idRestaurante, mes]
    );

    return resultado.rows;
}

// Obtener ventas de cada día del mes, incluyendo días sin ventas
async function obtenerVentasPorDia(idRestaurante, mes) {
    const resultado = await pool.query(
        `WITH dias AS (
            SELECT GENERATE_SERIES(
                DATE_TRUNC('month', TO_DATE($2 || '-01', 'YYYY-MM-DD')),
                DATE_TRUNC('month', TO_DATE($2 || '-01', 'YYYY-MM-DD'))
                    + INTERVAL '1 month' - INTERVAL '1 day',
                INTERVAL '1 day'
            )::date AS dia
         )
         SELECT
            dias.dia,
            COALESCE(SUM(p.total_pedido), 0) AS ventas_del_dia
         FROM dias
         LEFT JOIN pedido p
            ON p.id_restaurante = $1
            AND p.estado_pedido = 'entregado'
            AND p.hora_entrega >= dias.dia
            AND p.hora_entrega < dias.dia + INTERVAL '1 day'
         GROUP BY dias.dia
         ORDER BY dias.dia`,
        [idRestaurante, mes]
    );

    return resultado.rows;
}

// Obtener los cinco productos más vendidos
async function obtenerProductosMasVendidos(idRestaurante, mes) {
    const resultado = await pool.query(
        `SELECT
            pr.nombre AS producto,
            SUM(dp.cantidad) AS unidades_vendidas
         FROM pedido p
         INNER JOIN detalle_pedido dp
            ON dp.id_pedido = p.id
         INNER JOIN producto pr
            ON pr.id = dp.id_producto
         WHERE p.id_restaurante = $1
            AND p.estado_pedido = 'entregado'
            AND p.hora_entrega >= TO_DATE($2 || '-01', 'YYYY-MM-DD')
            AND p.hora_entrega < TO_DATE($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month'
         GROUP BY pr.id, pr.nombre
         ORDER BY unidades_vendidas DESC
         LIMIT 5`,
        [idRestaurante, mes]
    );

    return resultado.rows;
}

// Obtener calificación promedio y cantidad de valoraciones
async function obtenerCalificaciones(idRestaurante, mes) {
    const resultado = await pool.query(
        `SELECT
            ROUND(AVG(calificacion), 2) AS calificacion_promedio,
            COUNT(calificacion) AS total_calificaciones
         FROM pedido
         WHERE id_restaurante = $1
            AND estado_pedido = 'entregado'
            AND calificacion IS NOT NULL
            AND hora_entrega >= TO_DATE($2 || '-01', 'YYYY-MM-DD')
            AND hora_entrega < TO_DATE($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month'`,
        [idRestaurante, mes]
    );

    return resultado.rows[0];
}

// Obtener distribución de calificaciones
async function obtenerDistribucionCalificaciones(idRestaurante, mes) {
    const resultado = await pool.query(
        `SELECT
            calificacion,
            COUNT(*) AS cantidad_calificaciones
         FROM pedido
         WHERE id_restaurante = $1
            AND estado_pedido = 'entregado'
            AND calificacion IS NOT NULL
            AND hora_entrega >= TO_DATE($2 || '-01', 'YYYY-MM-DD')
            AND hora_entrega < TO_DATE($2 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month'
         GROUP BY calificacion
         ORDER BY calificacion DESC`,
        [idRestaurante, mes]
    );

    return resultado.rows;
}

// Obtener los cinco pedidos recibidos más recientemente
async function obtenerUltimosPedidos(idRestaurante) {
    const resultado = await pool.query(
        `SELECT
            p.id AS numero,
            CONCAT(c.nombre, ' ', c.apellido) AS cliente,
            p.estado_pedido,
            p.tipo_pago,
            p.total_pedido,
            p.hora_aceptacion
         FROM pedido p
         INNER JOIN cliente c
            ON c.id = p.id_cliente
         WHERE p.id_restaurante = $1
         ORDER BY p.fecha_creacion DESC
         LIMIT 5`,
        [idRestaurante]
    );

    return resultado.rows;
}

//consulta de los tres indicadores porcentuales
async function obtenerIndicadoresPorPeriodo(idRestaurante, fechaInicio, fechaFin) {

    const resultado = await pool.query(`
        SELECT
            COUNT(*) FILTER (
                WHERE fecha_creacion >= $2::date
                AND fecha_creacion < $3::date
            ) AS pedidos_recibidos,

            COALESCE(SUM(total_pedido) FILTER (
                WHERE estado_pedido = 'entregado'
                AND hora_entrega >= $2::date
                AND hora_entrega < $3::date
            ), 0) AS ventas_entregadas,

            COALESCE(SUM(co2_ahorrado) FILTER (
                WHERE estado_pedido = 'entregado'
                AND hora_entrega >= $2::date
                AND hora_entrega < $3::date
            ), 0) AS co2_total_ahorrado

        FROM pedido
        WHERE id_restaurante = $1
        AND (
            (fecha_creacion >= $2::date AND fecha_creacion < $3::date)
            OR
            (
                estado_pedido = 'entregado'
                AND hora_entrega >= $2::date
                AND hora_entrega < $3::date
            )
        )
    `, [idRestaurante, fechaInicio, fechaFin]);

    return resultado.rows[0];
}

function calcularVariacion(actual, anterior) {
    actual = Number(actual);
    anterior = Number(anterior);

    if (anterior === 0) {
        return {
            porcentaje: null,
            direccion: null
        };
    }

    const porcentaje = ((actual - anterior) / anterior) * 100;

    return {
        porcentaje: Number(porcentaje.toFixed(2)),
        direccion: porcentaje > 0 ? 'subio' :
                   porcentaje < 0 ? 'bajo' : 'igual'
    };
}

async function obtenerEstadisticas(idUsuario, mes) {
    const idRestaurante = await obtenerIdRestaurantePorUsuario(idUsuario);

    // Cálculo de los períodos a comparar
    const fechaActual = new Date();
    const [anio, numeroMes] = mes.split('-').map(Number);

    const inicioMes = new Date(anio, numeroMes - 1, 1);
    const inicioMesSiguiente = new Date(anio, numeroMes, 1);

    const esMesActual =
        anio === fechaActual.getFullYear() &&
        numeroMes === fechaActual.getMonth() + 1;

    const finPeriodo = esMesActual
        ? new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() + 1)
        : inicioMesSiguiente;

    const inicioMesAnterior = new Date(anio, numeroMes - 2, 1);

    const finMesAnterior = esMesActual
        ? new Date(anio, numeroMes - 2, fechaActual.getDate() + 1)
        : inicioMes;

    const formatearFecha = fecha => {
        return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    };


    const [
        pedidosRecibidos,
        ventasEntregadas,
        co2Ahorrado,
        pedidosPorEstado,
        ventasPorDia,
        productosMasVendidos,
        calificaciones,
        distribucionCalificaciones,
        ultimosPedidos,
        indicadoresActuales,
        indicadoresAnteriores
    ] = await Promise.all([
        obtenerPedidosRecibidos(idRestaurante, mes),
        obtenerVentasEntregadas(idRestaurante, mes),
        obtenerCo2Ahorrado(idRestaurante, mes),
        obtenerPedidosPorEstado(idRestaurante, mes),
        obtenerVentasPorDia(idRestaurante, mes),
        obtenerProductosMasVendidos(idRestaurante, mes),
        obtenerCalificaciones(idRestaurante, mes),
        obtenerDistribucionCalificaciones(idRestaurante, mes),
        obtenerUltimosPedidos(idRestaurante),
        obtenerIndicadoresPorPeriodo(idRestaurante,formatearFecha(inicioMes),formatearFecha(finPeriodo)),
        obtenerIndicadoresPorPeriodo(idRestaurante,formatearFecha(inicioMesAnterior),formatearFecha(finMesAnterior))
    ]);

    const variaciones = {
        pedidos_recibidos: calcularVariacion(
            indicadoresActuales.pedidos_recibidos,
            indicadoresAnteriores.pedidos_recibidos
        ),
        ventas_entregadas: calcularVariacion(
            indicadoresActuales.ventas_entregadas,
            indicadoresAnteriores.ventas_entregadas
        ),
        co2_total_ahorrado: calcularVariacion(
            indicadoresActuales.co2_total_ahorrado,
            indicadoresAnteriores.co2_total_ahorrado
        )
    };

    console.log('Pedidos recibidos:', pedidosRecibidos);
    console.log('Ventas entregadas:', ventasEntregadas);
    console.log('CO2 ahorrado:', co2Ahorrado);
    console.log('Calificaciones:', calificaciones);

    return {
        pedidos_recibidos: pedidosRecibidos.pedidos_recibidos,
        ventas_entregadas: ventasEntregadas.ventas_entregadas,
        co2_total_ahorrado: co2Ahorrado.co2_total_ahorrado,
        pedidos_por_estado: pedidosPorEstado,
        ventas_por_dia: ventasPorDia,
        productos_mas_vendidos: productosMasVendidos,
        calificaciones: calificaciones,
        distribucion_calificaciones: distribucionCalificaciones,
        ultimos_pedidos: ultimosPedidos,
        variaciones: variaciones
    };
}



module.exports = {
    obtenerIdRestaurantePorUsuario,
    obtenerPedidosRecibidos,
    obtenerVentasEntregadas,
    obtenerCo2Ahorrado,
    obtenerPedidosPorEstado,
    obtenerVentasPorDia,
    obtenerProductosMasVendidos,
    obtenerCalificaciones,
    obtenerDistribucionCalificaciones,
    obtenerUltimosPedidos,
    obtenerIndicadoresPorPeriodo,
    obtenerEstadisticas
};
