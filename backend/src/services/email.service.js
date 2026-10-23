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

    // Crea una cuenta temporal para probar el envío de correos.
    const cuentaPrueba = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: cuentaPrueba.smtp.host,
        port: cuentaPrueba.smtp.port,
        secure: cuentaPrueba.smtp.secure,
        auth: {
            user: cuentaPrueba.user,
            pass: cuentaPrueba.pass
        }
    });

    return transporter;
}

//recibe el destinatario y el rol, elige el texto correspondiente y envía el mensaje.
async function enviarBienvenida(email, rol) {
    const transporte = await obtenerTransporter();

    const tipoUsuario = rol === 'restaurante'
        ? 'restaurante'
        : 'cliente';

    const asunto =
        'Bienvenido/a a una forma diferente de pedir tu comida favorita';

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

¡Esperamos que disfrutes la experiencia EcoBite!`,
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

            <p>¡Esperamos que disfrutes la experiencia EcoBite!</p>
        `
    });

    //genera el enlace para visualizar el mensaje de prueba.
    const urlVistaPrevia = nodemailer.getTestMessageUrl(info);

    console.log('Correo de bienvenida preparado.');
    console.log('Vista previa:', urlVistaPrevia);

    return info;
}

//permite que server.js importe la función
module.exports = { enviarBienvenida };
