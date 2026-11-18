// ==========================================
// EMAIL.SERVICE
// Construye el mensaje y envia.
// ==========================================
const nodemailer = require('nodemailer');

let transporter;

//prepara la conexión con el servicio de correo de prueba.
async function obtenerTransporter() {
    if (transporter) {
        return transporter;
    }

    console.log('1. Intentando crear cuenta de Ethereal...');

    // Crea una cuenta temporal para probar el envío de correos.
    const cuentaPrueba = await nodemailer.createTestAccount();

    console.log('2. Cuenta de Ethereal creada correctamente.');

    transporter = nodemailer.createTransport({
        host: cuentaPrueba.smtp.host,
        port: cuentaPrueba.smtp.port,
        secure: cuentaPrueba.smtp.secure,
        auth: {
            user: cuentaPrueba.user,
            pass: cuentaPrueba.pass
        }
    });


    console.log('3. Transporter configurado.');

    return transporter;
}

//recibe el destinatario y el rol, elige el texto correspondiente y envía el mensaje.
async function enviarBienvenida(email, rol) {
    const transporte = await obtenerTransporter();

    const tipoUsuario = rol === 'restaurante'
        ? 'restaurante'
        : 'cliente';

    const asunto = 'Bienvenido/a a una forma diferente de pedir tu comida favorita';

    const info = await transporte.sendMail({//realiza el envío al servicio.
        from: '"EcoBite" <bienvenida@ecobite.com>',
        to: email,
        subject: asunto,
        text: `¡Bienvenido/a, ${email}!

¡Estamos felices de que te sumes a EcoBite!

Tu registro como ${tipoUsuario} se realizó correctamente.

Sabemos lo feo que es llegar a casa y no saber qué cocinar,
no tener tiempo o simplemente no tener ganas. En esos momentos,
pedir comida se vuelve la mejor opción.

Por eso, en EcoBite te lo hacemos más fácil. Disfrutá de tu comida 
favorita y, de paso, cuidá el medioambiente con restaurantes que usan 
envases 100% biodegradables y entregas mediante transporte sin emisiones.
Y lo mejor es que, con cada pedido, podés conocer cuánto dióxido de carbono
ayudaste a reducir.💚
¿Ya sabés qué vas a comer? 
Explorá nuestro catálogo, pedí lo que te gusta y descubrí cuánto CO₂ evitás con cada pedido.

¡Tu comida, sin dejar huella!
¡A disfrutar!`,
        html: `
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

            <p> Por eso, en EcoBite te lo hacemos más fácil. Disfrutá 
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

        `
    });

    //genera el enlace para visualizar el mensaje de prueba.
    const urlVistaPrevia = nodemailer.getTestMessageUrl(info);
    //conservar la URL de vista previa únicamente durante el desarrollo, sin mostrarla en producción.
    /* if (process.env.NODE_ENV !== 'production') {
        console.log('Vista previa de Correo Bienvenida:', urlVistaPrevia);
    } */
   console.log('Vista previa de Correo Bienvenida:', urlVistaPrevia);

    return info;
}


async function enviarRecordatorioCarritoAbandonado(email, idCarrito) {
    const transporte = await obtenerTransporter();

    const asunto = 'Tu comida sigue en el carrito 🍃';
    const urlCarrito = 'https://s2603-eco-bite.vercel.app/carrito';

    const info = await transporte.sendMail({
        from: '"EcoBite" <bienvenida@ecobite.com>',
        to: email,
        subject: asunto,
        text: `¡Hola! 💚
        ¡Tu pedido de EcoBite quedó en pausa!
        ¿Te olvidaste de tu pedido? Tranqui, todavia podes disfrutarlo. 
        Volvé a tu carrito, completá tu pedido y recibí tu comida en envases 100% biodegradables y mediante entregas en transporte sin emisiones. Así, disfrutás de lo que te gusta mientras cuidamos el medioambiente. 🌱
        Además, descubrí cuánto CO₂ evitás con tu pedido y mirá el impacto de tu elección.
        Volver a mi carrito: ${urlCarrito}
        ¡Tu comida, sin dejar huella! 🌎
        El equipo de EcoBite 💚
        `,
        html: `
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
        `
    });

    const urlVistaPrevia = nodemailer.getTestMessageUrl(info);

   /*  if (process.env.NODE_ENV !== 'production') {
        console.log(
            `Vista previa del correo de carrito abandonado (carrito ${idCarrito}):`,
            urlVistaPrevia
        );
    } */
   console.log('Vista previa de Correo Bienvenida:', urlVistaPrevia);

    return info;
}


//permite que server.js importe la función
module.exports = { 
    enviarBienvenida,
    enviarRecordatorioCarritoAbandonado
};
