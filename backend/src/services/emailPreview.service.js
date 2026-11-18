
const crypto = require('crypto');

const vistasPrevias = new Map();

const DURACION_PREVIEW = 60 * 60 * 1000; // 1 hora

// Guarda el HTML temporalmente y devuelve un identificador único.
function guardarVistaPrevia(html) {
    const id = crypto.randomBytes(24).toString('hex');

    vistasPrevias.set(id, {
        html,
        expira: Date.now() + DURACION_PREVIEW
    });

    return id;
}

// Recupera el HTML si el enlace todavía no venció.
function obtenerVistaPrevia(id) {
    const vista = vistasPrevias.get(id);

    if (!vista) {
        return null;
    }

    if (Date.now() > vista.expira) {
        vistasPrevias.delete(id);
        return null;
    }

    return vista.html;
}

function generarHtmlBienvenida(email, rol) {
    const tipoUsuario = rol === 'restaurante'
        ? 'restaurante'
        : 'cliente';

    return `
        <h2>¡Bienvenido/a, ${email}!</h2>

        <p>¡Estamos felices de que te sumes a EcoBite!</p>

        <p>Tu registro como <strong>${tipoUsuario}</strong>
        se realizó correctamente.</p>

        <p>
            Sabemos lo feo que es llegar a casa y no saber
            qué cocinar, no tener tiempo o simplemente no
            tener ganas. En esos momentos, pedir comida se
            vuelve la mejor opción.
        </p>

        <p>
            Por eso, en EcoBite te lo hacemos más fácil. Disfrutá
            de tu comida favorita y, de paso, cuidá el medioambiente
            con restaurantes que usan envases 100% biodegradables y
            entregas mediante transporte sin emisiones.
            Y lo mejor es que, con cada pedido, podés conocer cuánto
            dióxido de carbono ayudaste a reducir.💚
        </p>

        <p>
            ¿Ya sabés qué vas a comer?
            Explorá nuestro catálogo, pedí lo que te gusta y descubrí cuánto CO₂
            evitás con cada pedido.
        </p>

        <p>
            ¡Tu comida, sin dejar huella!
            ¡A disfrutar!
        </p>
    `;
}

function generarHtmlRecordatorio() {
    const urlCarrito = 'https://s2603-eco-bite.vercel.app/carrito';

    return `
        <h2>¡Hola! 💚</h2>

        <p><strong>¡Tu pedido de EcoBite quedó en pausa!</strong></p>

        <p>
            ¿Te olvidaste de tu pedido? Tranqui, todavia podes disfrutarlo.
        </p>

        <p>
            Volvé a tu carrito, completá tu pedido y recibí tu comida en envases 100% biodegradables
            y mediante entregas en transporte sin emisiones. Así, disfrutás de lo que te gusta mientras
            cuidamos el medioambiente. 🌱
        </p>

        <p>
            Además, descubrí cuánto CO₂ evitás con tu pedido y mirá el impacto de tu elección.
        </p>

        <p style="text-align: center; margin: 30px 0;">
            <a href="${urlCarrito}"
               style="
                   background-color: #2e7d32;
                   color: white;
                   padding: 12px 24px;
                   text-decoration: none;
                   border-radius: 6px;
                   font-weight: bold;
                   display: inline-block;
               ">
                Volver a mi carrito
            </a>
        </p>

        <p>¡Tu comida, sin dejar huella! 🌎</p>

        <p><strong>El equipo de EcoBite 💚</strong></p>
    `;
}

// Envuelve el contenido en una página HTML completa.
function crearPaginaHtml(contenido) {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vista previa - EcoBite</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 30px;">
            ${contenido}
        </body>
        </html>
    `;
}

function crearVistaPreviaBienvenida(email, rol) {
    const contenido = generarHtmlBienvenida(email, rol);
    const html = crearPaginaHtml(contenido);

    return guardarVistaPrevia(html);
}

function crearVistaPreviaRecordatorio() {
    const contenido = generarHtmlRecordatorio();
    const html = crearPaginaHtml(contenido);

    return guardarVistaPrevia(html);
}

module.exports = {
    crearVistaPreviaBienvenida,
    crearVistaPreviaRecordatorio,
    obtenerVistaPrevia
};
