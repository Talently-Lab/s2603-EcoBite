
const crypto = require('crypto');

const urlFrontend = process.env.NODE_ENV === 'production'
    ? 'https://s2603-eco-bite.vercel.app'
    : 'http://localhost:5173';

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
        <div style="
            max-width: 600px;
            margin: 20px auto;
            padding: 30px;
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.7;
            border: 1px solid #e0e8df;
            border-radius: 12px;
            background-color: #ffffff;
        ">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #2e7d32; margin-bottom: 5px;">
                    🌱 EcoBite
                </h1>
                <p style="color: #689f38; margin-top: 0;">
                    Tu comida, sin dejar huella
                </p>
            </div>

            <h2 style="color: #2e7d32;">
                ¡Bienvenido/a a EcoBite! 💚
            </h2>

            <p>
                ¡Estamos felices de que te sumes a nuestra comunidad!
            </p>

            <p style="color: #666; font-size: 14px;">
                <strong>Cuenta registrada:</strong> ${email}
            </p>

            <div style="
                background-color: #e8f5e9;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
                color: #2e7d32;
            ">
                <strong>✓ ¡Tu registro como ${tipoUsuario} se realizó correctamente!</strong>
                <p style="margin-bottom: 0;">Ya sos parte de EcoBite. 🌿</p>
            </div>

            <p>
                Sabemos lo feo que es llegar a casa y no saber qué cocinar,
                no tener tiempo o simplemente no tener ganas. En esos momentos,
                pedir comida se vuelve la mejor opción.
            </p>

            <p>
                Por eso, en <strong>EcoBite</strong> te lo hacemos más fácil.
                Disfrutá de tu comida favorita y, de paso, cuidá el medioambiente
                con restaurantes que usan <strong>envases 100% biodegradables</strong>
                y entregas mediante <strong>transporte sin emisiones</strong>. 🚲
            </p>

            <p>
                Y lo mejor es que, con cada pedido, podés conocer cuánto
                <strong>CO₂ ayudaste a reducir</strong>. 💚
            </p>

            <p>
                🌱 <strong>¿Ya sabés qué vas a comer?</strong><br>
                Explorá nuestro catálogo, pedí lo que te gusta y descubrí
                cuánto CO₂ evitás con cada pedido.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${urlFrontend}/"
                   style="
                       background-color: #2e7d32;
                       color: white;
                       padding: 13px 25px;
                       text-decoration: none;
                       border-radius: 6px;
                       font-weight: bold;
                       display: inline-block;
                       margin: 5px;
                   ">
                    🏡 Ir al inicio
                </a>

                <a href="${urlFrontend}/login"
                   style="
                       background-color: #81c784;
                       color: #1b5e20;
                       padding: 13px 25px;
                       text-decoration: none;
                       border-radius: 6px;
                       font-weight: bold;
                       display: inline-block;
                       margin: 5px;
                   ">
                    🔐 Iniciar sesión
                </a>
            </div>

            <div style="
                text-align: center;
                border-top: 1px solid #e0e8df;
                padding-top: 20px;
                margin-top: 30px;
            ">
                <h3 style="color: #2e7d32;">
                    ¡Tu comida, sin dejar huella! 🌎
                </h3>
                <p style="color: #689f38;">
                    ¡A disfrutar! 💚🌱
                </p>
                <p style="font-size: 12px; color: #888;">
                    El equipo de EcoBite
                </p>
            </div>
        </div>
    `;
}


function generarHtmlRecordatorio() {
    const urlCarrito = `${urlFrontend}/carrito`;

    return `
        <div style="
            max-width: 600px;
            margin: 20px auto;
            padding: 30px;
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.7;
            border: 1px solid #e0e8df;
            border-radius: 12px;
            background-color: #ffffff;
        ">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #2e7d32; margin-bottom: 5px;">
                    🌱 EcoBite
                </h1>
                <p style="color: #689f38; margin-top: 0;">
                    Tu comida, sin dejar huella
                </p>
            </div>

            <h2 style="color: #2e7d32;">
                ¡Hola! 💚
            </h2>

            <div style="
                background-color: #e8f5e9;
                padding: 18px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
                color: #2e7d32;
            ">
                <h3 style="margin: 0;">
                    🛒 ¡Tu pedido de EcoBite quedó en pausa!
                </h3>
                <p style="margin-bottom: 0;">
                    ¡No te olvides de lo rico que te espera!
                </p>
            </div>

            <p>
                ¿Te olvidaste de tu pedido? ¡Tranqui! Todavía podés disfrutarlo. 😊
            </p>

            <p>
                Volvé a tu carrito, completá tu pedido y recibí tu comida en
                <strong>envases 100% biodegradables</strong> y mediante entregas
                en <strong>transporte sin emisiones</strong>. Así, disfrutás de
                lo que te gusta mientras cuidamos el medioambiente. 🌱
            </p>

            <p>
                Además, descubrí cuánto <strong>CO₂ evitás con tu pedido</strong>
                y mirá el impacto positivo de tu elección. 💚
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${urlCarrito}"
                   style="
                       background-color: #2e7d32;
                       color: white;
                       padding: 13px 25px;
                       text-decoration: none;
                       border-radius: 6px;
                       font-weight: bold;
                       display: inline-block;
                       margin: 5px;
                   ">
                    🛒 Volver a mi carrito
                </a>

                <a href="${urlFrontend}/"
                   style="
                       background-color: #81c784;
                       color: #1b5e20;
                       padding: 13px 25px;
                       text-decoration: none;
                       border-radius: 6px;
                       font-weight: bold;
                       display: inline-block;
                       margin: 5px;
                   ">
                    🏡 Ir al inicio
                </a>
            </div>

            <div style="
                text-align: center;
                border-top: 1px solid #e0e8df;
                padding-top: 20px;
                margin-top: 30px;
            ">
                <h3 style="color: #2e7d32;">
                    ¡Tu comida, sin dejar huella! 🌎
                </h3>
                <p style="color: #689f38;">
                    ¡Te esperamos! 💚🌱
                </p>
                <p style="font-size: 12px; color: #888;">
                    El equipo de EcoBite
                </p>
            </div>
        </div>
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
