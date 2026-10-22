// ==========================================
// MODELO DE PEDIDO
// Operaciones sobre la tabla PEDIDO
// ==========================================

const pool = require('../db');

async function crear(pedido) {
    const {
        id_usuario,
        id_restaurante,
        id_zona,
        productos,
        tipo_pago,
        costo_envio = 0,
        direccion_entrega,
        piso_entrega,
        departamento_entrega,
        indicacion_entrega
    } = pedido;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Buscar el perfil de cliente asociado al usuario autenticado
        const resultadoCliente = await client.query(
            'SELECT id FROM cliente WHERE id_usuario = $1',
            [id_usuario]
        );

        if (resultadoCliente.rows.length === 0) {
            throw new Error('El usuario no tiene un perfil de cliente');
        }

        const id_cliente = resultadoCliente.rows[0].id;

        // 2. Verificar que exista el restaurante
        const resultadoRestaurante = await client.query(
            'SELECT id FROM restaurante WHERE id = $1',
            [id_restaurante]
        );

        if (resultadoRestaurante.rows.length === 0) {
            throw new Error('El restaurante no existe');
        }

        // 3. Consultar la zona y su distancia promedio
        const resultadoZona = await client.query(
            'SELECT id, distancia_promedio FROM zona WHERE id = $1',
            [id_zona]
        );

        if (resultadoZona.rows.length === 0) {
            throw new Error('La zona no existe');
        }

        // 4. Consultar los productos y sus precios reales
        const idsProductos = productos.map(
            producto => producto.id_producto
        );

        const resultadoProductos = await client.query(
            `SELECT id, precio
             FROM producto
             WHERE id = ANY($1::int[])
               AND id_restaurante = $2
               AND disponible = TRUE`,
            [idsProductos, id_restaurante]
        );

        if (resultadoProductos.rows.length !== productos.length) {
            throw new Error(
                'Hay productos que no existen, no están disponibles o no pertenecen al restaurante'
            );
        }

        // 5. Calcular subtotales y total utilizando los precios de la base
        let subtotalProductos = 0;
        const detalles = [];

        for (const item of productos) {
            const productoBD = resultadoProductos.rows.find(
                producto => producto.id === item.id_producto
            );

            const precioCentavos = Math.round(
                Number(productoBD.precio) * 100
            );

            const subtotalCentavos = precioCentavos * item.cantidad;

            subtotalProductos += subtotalCentavos;

            detalles.push({
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unitario: precioCentavos / 100,
                subtotal: subtotalCentavos / 100
            });
        }

        // El costo de envío se suma al precio de los productos
        const totalCentavos = subtotalProductos + Math.round(Number(costo_envio) * 100);

        const total_pedido = totalCentavos / 100;

        // 6. Estimar el CO2 según la fórmula provisional del proyecto
        // Distancia (km) × 105 g/km ÷ 1000 = kg
        const distanciaKm = Number( resultadoZona.rows[0].distancia_promedio);

        const co2_ahorrado = Number(((distanciaKm * 105) / 1000).toFixed(3));

        // 7. Guardar el pedido con estado inicial pendiente
        const resultadoPedido = await client.query(
            `INSERT INTO pedido (
                id_cliente,
                id_restaurante,
                id_zona,
                estado_pedido,
                total_pedido,
                tipo_pago,
                costo_envio,
                direccion_entrega,
                piso_entrega,
                departamento_entrega,
                indicacion_entrega,
                co2_ahorrado
            )
            VALUES (
                $1, $2, $3, 'pendiente', $4, $5,
                $6, $7, $8, $9, $10, $11
            )
            RETURNING *`,
            [
                id_cliente,
                id_restaurante,
                id_zona,
                total_pedido,
                tipo_pago,
                Number(costo_envio),
                direccion_entrega || null,
                piso_entrega || null,
                departamento_entrega || null,
                indicacion_entrega || null,
                co2_ahorrado
            ]
        );

        const nuevoPedido = resultadoPedido.rows[0];

        // 8. Guardar cada producto relacionado con el pedido
        for (const detalle of detalles) {
            await client.query(
                `INSERT INTO detalle_pedido (
                    id_pedido,
                    id_producto,
                    cantidad,
                    precio_unitario,
                    subtotal
                )
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    nuevoPedido.id,
                    detalle.id_producto,
                    detalle.cantidad,
                    detalle.precio_unitario,
                    detalle.subtotal
                ]
            );
        }

        // 9. Confirmar todas las operaciones
        await client.query('COMMIT');

        return {
            ...nuevoPedido,
            detalles
        };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;

    } finally {
        client.release();
    }
}

async function aceptarPedido(idPedido, idUsuario) {
    const resultado = await pool.query(
        `UPDATE pedido AS p
         SET estado_pedido = 'en_preparacion',
             hora_aceptacion = CURRENT_TIMESTAMP
         FROM restaurante AS r
         WHERE p.id = $1
           AND r.id_usuario = $2
           AND p.id_restaurante = r.id
           AND p.estado_pedido = 'pendiente'
         RETURNING p.*`,
        [idPedido, idUsuario]
    );

    if (resultado.rows.length === 0) {
        return null;
    }

    return resultado.rows[0];
}

async function despacharPedido(idPedido, idUsuario) {
    const resultado = await pool.query(
        `UPDATE pedido AS p
         SET estado_pedido = 'despachado',
             hora_despacho = CURRENT_TIMESTAMP
         FROM restaurante AS r
         WHERE p.id = $1
           AND r.id_usuario = $2
           AND p.id_restaurante = r.id
           AND p.estado_pedido = 'en_preparacion'
         RETURNING p.*`,
        [idPedido, idUsuario]
    );

    if (resultado.rows.length === 0) {
        return null;
    }

    return resultado.rows[0];
}

async function confirmarEntrega(idPedido, idUsuario) {
    const resultado = await pool.query(
        `UPDATE pedido AS p
         SET estado_pedido = 'entregado',
             hora_entrega = CURRENT_TIMESTAMP
         FROM cliente AS c
         WHERE p.id = $1
           AND c.id_usuario = $2
           AND p.id_cliente = c.id
           AND p.estado_pedido = 'despachado'
         RETURNING p.*`,
        [idPedido, idUsuario]
    );

    if (resultado.rows.length === 0) {
        return null;
    }

    return resultado.rows[0];
}


async function calificarPedido(idPedido, idUsuario, calificacion) {
    const resultado = await pool.query(
        `UPDATE pedido AS p
         SET calificacion = $3
         FROM cliente AS c
         WHERE p.id = $1
           AND c.id_usuario = $2
           AND p.id_cliente = c.id
           AND p.estado_pedido = 'entregado'
           AND p.calificacion IS NULL
         RETURNING p.*`,
        [idPedido, idUsuario, calificacion]
    );

    if (resultado.rows.length === 0) {
        return null;
    }

    return resultado.rows[0];
}

// Rechazar un pedido desde el restaurante
async function rechazarPedido(idPedido, idUsuario) {
    const resultado = await pool.query(
        `UPDATE pedido AS p
         SET estado_pedido = 'rechazado'
         FROM restaurante AS r
         WHERE p.id = $1
           AND r.id_usuario = $2
           AND p.id_restaurante = r.id
           AND p.estado_pedido = 'pendiente'
         RETURNING p.*`,
        [idPedido, idUsuario]
    );

    return resultado.rows[0] || null;
}

// Cancelar un pedido desde el cliente
async function cancelarPedido(idPedido, idUsuario) {
    const resultado = await pool.query(
        `UPDATE pedido AS p
         SET estado_pedido = CASE
             WHEN p.hora_aceptacion IS NULL
               OR CURRENT_TIMESTAMP < p.hora_aceptacion + INTERVAL '20 minutes'
             THEN 'cancelado'
             ELSE 'cancelado_demora'
         END
         FROM cliente AS c
         WHERE p.id = $1
           AND c.id_usuario = $2
           AND p.id_cliente = c.id
           AND p.estado_pedido IN ('pendiente', 'en_preparacion')
         RETURNING p.*`,
        [idPedido, idUsuario]
    );

    return resultado.rows[0] || null;
}

// Cancelar automáticamente pedidos que superaron los 30 minutos
async function cancelarPedidosDemorados() {
    const resultado = await pool.query(
        `UPDATE pedido
         SET estado_pedido = 'cancelado_demora'
         WHERE estado_pedido = 'en_preparacion'
           AND hora_aceptacion IS NOT NULL
           AND hora_aceptacion <= CURRENT_TIMESTAMP - INTERVAL '30 minutes'
         RETURNING id`
    );

    return resultado.rows;
}

module.exports = { 
    crear,
    aceptarPedido,
    despacharPedido,
    confirmarEntrega,
    calificarPedido,
    rechazarPedido,
    cancelarPedido,
    cancelarPedidosDemorados
};
