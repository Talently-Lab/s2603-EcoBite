// ==========================================
// VALIDACIONES
// Validaciones que usaremos en los registros
// ==========================================
class ErrorValidacion extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = 'ErrorValidacion';
    }
}

// Validar campos de texto
function validarTexto(valor, campo, opciones = {}) {
    const {
        minimo = 1,
        maximo,
        obligatorio = false
    } = opciones;

    // Comprobar si el campo fue enviado
    if (valor === undefined || valor === null) {
        if (obligatorio) {
            throw new ErrorValidacion(`${campo} es obligatorio`);
        }

        return null;
    }

    // Comprobar que sea texto
    if (typeof valor !== 'string') {
        throw new ErrorValidacion(`${campo} debe ser un texto`);
    }

    // Quitar espacios al principio y al final
    const texto = valor.trim();

    // Comprobar que no esté vacío
    if (texto.length === 0) {
        if (obligatorio) {
            throw new ErrorValidacion(`${campo} es obligatorio`);
        }

        return null;
    }

    // Contar caracteres
    const longitud = Array.from(texto).length;

    if (longitud < minimo) {
        throw new ErrorValidacion(`${campo} debe tener al menos ${minimo} caracteres` );
    }

    if (maximo !== undefined && longitud > maximo) {
        throw new ErrorValidacion(`${campo} no puede superar los ${maximo} caracteres`);
    }

    return texto;
}

// Validar teléfono argentino
function validarTelefono(valor) {
    if (typeof valor !== 'string' || !/^(?:\d{10}|\d{13})$/.test(valor)) {
        throw new ErrorValidacion('El teléfono debe tener 10 o 13 números, sin espacios ni guiones');
    }

    return valor;
}

// Validar canal de adquisición
function validarCanalAdquisicion(valor) {
    const canalesPermitidos = [
        'Redes sociales',
        'Recomendación',
        'Búsqueda en internet',
        'Otro'
    ];

    if (typeof valor !== 'string' || !canalesPermitidos.includes(valor.trim())) {
        throw new ErrorValidacion('El canal de adquisición seleccionado no es válido');
    }

    return valor.trim();
}

// Validar email
function validarEmail(valor) {
    if (typeof valor !== 'string' || !valor.trim()) {
        throw new ErrorValidacion('El email es obligatorio');
    }
    const email = valor.trim();

    if (email.length > 150) {
        throw new ErrorValidacion('El email no puede superar los 150 caracteres');
    }

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
        throw new ErrorValidacion('El formato del email no es válido');
    }

    return email;
}

// Validar contraseña (regla temporal para pruebas)
function validarContrasena(valor) {
    if (typeof valor !== 'string' || valor.length < 8) {
        throw new ErrorValidacion('La contraseña debe tener al menos 8 caracteres');
    }
    /*
    // VALIDACIÓN DEFINITIVA
    if (valor.length < 8 || !/[A-Z]/.test(valor) || !/[0-9]/.test(valor))
    {
        throw new ErrorValidacion('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
    }
    */
    // Verificar que no supere los 72 bytes admitidos por bcrypt
    if (Buffer.byteLength(valor, 'utf8') > 72) {
        throw new ErrorValidacion('La contraseña no puede superar los 72 bytes');
    }
    
    return valor;
}

// Validar URL de imagen
function validarUrlImagen(valor) {
    if (typeof valor !== 'string' || !valor.trim()) {
        throw new ErrorValidacion('La URL de la imagen es obligatoria');
    }

    const url = valor.trim();

    if (url.length > 255) {
        throw new ErrorValidacion('La URL de la imagen no puede superar los 255 caracteres');
    }

    try {
        const urlValidada = new URL(url);

        if (urlValidada.protocol !== 'http:' && urlValidada.protocol !== 'https:') {
            throw new ErrorValidacion();
        }
    } catch {
        throw new ErrorValidacion('La URL de la imagen no es válida');
    }

    return url;
}

// Validar precio
function validarPrecio(valor) {
    if (
        valor === undefined ||
        valor === null ||
        valor === '' ||
        !Number.isFinite(Number(valor)) ||
        Number(valor) <= 0
    ) {
        throw new ErrorValidacion('El precio debe ser un número mayor que cero');
    }

    return Number(valor);
}

// Validar disponibilidad
function validarDisponible(valor) {
    if (typeof valor !== 'boolean') {
        throw new ErrorValidacion('La disponibilidad debe ser true o false');
    }

    return valor;
}

function validarEnteroPositivo(valor, campo) {
    if (!Number.isInteger(valor) || valor <= 0) {
        throw new ErrorValidacion(`${campo} debe ser un entero positivo`);
    }

    return valor;
}

function validarCostoEnvio(valor) {
    if (
        typeof valor !== 'number' ||
        !Number.isFinite(valor) ||
        valor < 0
    ) {
        throw new ErrorValidacion(
            'El costo de envío debe ser un número mayor o igual a cero'
        );
    }

    return valor;
}

function validarTipoPago(valor) {
    if (!['efectivo', 'tarjeta'].includes(valor)) {
        throw new ErrorValidacion(
            'El tipo de pago debe ser efectivo o tarjeta'
        );
    }

    return valor;
}

module.exports = {
    ErrorValidacion,
    validarTexto,
    validarTelefono,
    validarCanalAdquisicion,
    validarEmail,
    validarContrasena,
    validarUrlImagen,
    validarPrecio,
    validarDisponible,
    validarEnteroPositivo,
    validarCostoEnvio,
    validarTipoPago
};