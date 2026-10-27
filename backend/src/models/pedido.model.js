// ==========================================
// MODELO DE PEDIDO
// Operaciones sobre la tabla PEDIDO
// ==========================================

const pool = require('../db');

async function crear(pedido) {
    const {
        id_usuario,
        id_carrito,
        id_zona,
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

        // 1. Buscar el perfil del cliente
        const resultadoCliente = await client.query(
            `SELECT id
             FROM cliente
             WHERE id_usuario = $1`,
            [id_usuario]
        );

        if (resultadoCliente.rows.length === 0) {
            throw new Error('El usuario no tiene un perfil de cliente');
        }

        const id_cliente = resultadoCliente.rows[0].id;

        // 2. Buscar y bloquear el carrito durante la operación
        const resultadoCarrito = await client.query(
            `SELECT id, id_cliente, id_restaurante, estado
             FROM carrito
             WHERE id = $1
             FOR UPDATE`,
            [id_carrito]
        );

        if (resultadoCarrito.rows.length === 0) {
            throw new Error('El carrito no existe');
        }

        const carrito = resultadoCarrito.rows[0];

        if (Number(carrito.id_cliente) !== Number(id_cliente)) {
            throw new Error('El carrito no pertenece al cliente');
        }

        if (carrito.estado !== 'pendiente') {
            throw new Error('El carrito no está pendiente');
        }

        const id_restaurante = carrito.id_restaurante;

        // 3. Consultar la zona y su distancia promedio
        const resultadoZona = await client.query(
            `SELECT id, distancia_promedio
             FROM zona
             WHERE id = $1`,
            [id_zona]
        );

        if (resultadoZona.rows.length === 0) {
            throw new Error('La zona no existe');
        }

        // 4. Obtener los productos guardados en el carrito
        const resultadoProductos = await client.query(
            `SELECT
                dc.id_producto,
                dc.cantidad,
                p.precio,
                p.id_restaurante,
                p.disponible
             FROM detalle_carrito dc
             INNER JOIN producto p ON p.id = dc.id_producto
             WHERE dc.id_carrito = $1`,
            [id_carrito]
        );

        const productos = resultadoProductos.rows;

        if (productos.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // 5. Verificar que todos los productos sigan disponibles
        for (const producto of productos) {
            if (
                Number(producto.id_restaurante) !== Number(id_restaurante) ||
                !producto.disponible
            ) {
                throw new Error(
                    'Hay productos que no están disponibles o no pertenecen al restaurante'
                );
            }
        }

        // 6. Calcular los importes con los precios de la base de datos
        let subtotalCentavos = 0;
        const detalles = [];

        for (const producto of productos) {
            const precioCentavos = Math.round(
                Number(producto.precio) * 100
            );

            const importeCentavos =
                precioCentavos * Number(producto.cantidad);

            subtotalCentavos += importeCentavos;

            detalles.push({
                id_producto: producto.id_producto,
                cantidad: Number(producto.cantidad),
                precio_unitario: precioCentavos / 100,
                subtotal: importeCentavos / 100
            });
        }

        const costoEnvioCentavos = Math.round(
            Number(costo_envio) * 100
        );

        const total_pedido =
            (subtotalCentavos + costoEnvioCentavos) / 100;

        // 7. Calcular el CO2 ahorrado según la fórmula del proyecto
        const distanciaKm = Number(
            resultadoZona.rows[0].distancia_promedio
        );

        const co2_ahorrado = Number(
            ((distanciaKm * 105) / 1000).toFixed(3)
        );

        // 8. Crear el pedido vinculado al carrito
        const resultadoPedido = await client.query(
            `INSERT INTO pedido (
                id_cliente,
                id_restaurante,
                id_zona,
                id_carrito,
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
                $1, $2, $3, $4, 'pendiente', $5, $6,
                $7, $8, $9, $10, $11, $12
            )
            RETURNING *`,
            [
                id_cliente,
                id_restaurante,
                id_zona,
                id_carrito,
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

        // 9. Copiar los productos a detalle_pedido
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

        // 10. Marcar el carrito como convertido
        await client.query(
            `UPDATE carrito
             SET estado = 'convertido',
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [id_carrito]
        );

        // 11. Confirmar todas las operaciones
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

async function marcarNoEntregado(idPedido, idUsuario) {
    const resultado = await pool.query(
        `UPDATE pedido AS p
         SET estado_pedido = 'no_entregado'
         FROM cliente AS c
         WHERE p.id = $1
           AND c.id_usuario = $2
           AND p.id_cliente = c.id
           AND p.estado_pedido = 'despachado'
         RETURNING p.*`,
        [idPedido, idUsuario]
    );

    return resultado.rows[0] || null;
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
    marcarNoEntregado,
    calificarPedido,
    rechazarPedido,
    cancelarPedido,
    cancelarPedidosDemorados
};
