
// ==========================================
// SERVIDOR Y RUTAS DE LA API
// Configuración de Express y atención de solicitudes HTTP
// ==========================================
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const cloudinary = require('./cloudinary');
const { Readable } = require('stream');

const { enviarBienvenida } = require('./services/email.service');
const subirImagen = require('./middlewares/subirImagen');
const { verificarToken, verificarRol } = require('./middlewares/auth.middleware');
const { obtenerPublicIdDesdeUrl } = require('./cloudinary.utils');

//MODELOS
const restauranteModel = require('./models/restaurante.model');//importa restaurante.model
const usuarioModel = require('./models/usuario.model');//importar usuario.model
const clienteModel = require('./models/cliente.model');//importar cliente.model
const horarioRestauranteModel = require('./models/horario_restaurante.model');
const pedidoModel = require('./models/pedido.model');
const productoModel = require('./models/producto.model');
const carritoModel = require('./models/carrito.model');
const detalleCarritoModel = require('./models/detalleCarrito.model');

const app = express();
const PORT = 3000;

// Permite recibir datos en formato JSON
app.use(express.json());

// GET pagina principal
app.get('/', (req, res) => {
    res.json({
        mensaje: '¡Servidor de EcoBite funcionando!'
    });
});

//=========MIDDLEWARE=========
// RUTA PROTEGIDA DE PRUEBA
app.get('/api/usuario/perfil', verificarToken, (req, res) => {
    res.status(200).json({
        mensaje: 'Acceso autorizado',
        usuario: req.usuario
    });
});

// RUTA DE PRUEBA EXCLUSIVA PARA RESTAURANTES
app.get('/api/prueba/restaurante',verificarToken, verificarRol('restaurante'),(req, res) => {
    res.status(200).json({
        mensaje: 'Acceso autorizado para restaurante',
        usuario: req.usuario
    });
  }
);

//============USUARIO============
// REGISTRAR USUARIO-CLIENTE
app.post('/api/usuario/registro-cliente', async (req, res) => {
    try {

        // Validar que el body se haya recibido como objeto
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                error: 'Debés enviar los datos en formato JSON'
            });
        }
        //--------------------
        const usuario = await usuarioModel.crearCliente(req.body);

        //Token para poder crear perfil
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        //----------------------
        //Envio de email
        try {
            await enviarBienvenida(usuario.email,'cliente');
        } catch (error) {
            console.error('No se pudo enviar el correo de bienvenida:', error.message);
        }
        //----------------

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            token,//se devuelve token
            usuario
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);

        if (error.message === 'Faltan datos obligatorios') {
            return res.status(400).json({
                error: error.message
            });
        }

        // Email duplicado
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Ese mail ya está registrado'
            });
        }
        //-----------------
        res.status(500).json({
            error: 'Error interno al registrar el usuario'
        });
    }
});

//REGISTRAR USUARIO-RESTAURANTE
app.post('/api/usuario/registro-restaurante', async (req, res) => {
    try {
        // Validar que el body se haya recibido como objeto
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                error: 'Debés enviar los datos en formato JSON'
            });
        }
        //------------------
        const usuario = await usuarioModel.crearRestaurante(req.body);

        //Token para poder crear perfil
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        //-----------------------
        
        //Envio de email
        try {
            await enviarBienvenida(usuario.email, 'restaurante');
        } catch (error) {
            console.error('No se pudo enviar el correo de bienvenida:', error.message);
        }
        //------------

        res.status(201).json({
            mensaje: 'Cuenta de restaurante creada correctamente',
            token,//se devuelve token
            usuario
        });
    } catch (error) {
        if (error.message === 'Faltan datos obligatorios') {
            return res.status(400).json({
                error: error.message
            });
        }

        // Email duplicado
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Ese email ya está registrado'
            });
        }

        console.error('Error al registrar restaurante:', error.message);

        res.status(500).json({
            error: 'Error interno al registrar la cuenta'
        });
    }
});


// CONSULTAR TODOS LOS USUARIOS
app.get('/api/usuarios', verificarToken, verificarRol('administrador'),async (req, res) => {
    try {
        const usuarios = await usuarioModel.obtenerTodos();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al consultar usuarios:', error.message);
        res.status(500).json({
            error: 'Error al consultar los usuarios'
        });
    }
});

// CONSULTAR UN USUARIO POR ID
app.get('/api/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        // Solo puede consultar su propia cuenta o ser administrador
        if (Number(req.usuario.id) !== id && req.usuario.rol !== 'administrador') {
            return res.status(403).json({
                error: 'No tenés permisos para consultar esta cuenta'
            });
        }

        const usuario = await usuarioModel.obtenerPorId(id);

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al consultar usuario:', error.message);
        res.status(500).json({
            error: 'Error al consultar el usuario'
        });
    }
});

//MODIFICAR UN USUARIO
app.put('/api/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        //validar id(num)
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        //Validar el cuerpo recibido
        const datos = req.body;

        if (!datos ||typeof datos !== 'object' ||Array.isArray(datos)) {
            return res.status(400).json({
                error: 'Debés enviar los datos en formato JSON'
            });
        }

         //Verificar que se envíen campos para actualizar
        if (Object.keys(datos).length === 0) {
            return res.status(400).json({
                error: 'No se enviaron campos para modificar'
            });
        }

        // Verificar permisos: que el usuario solo modifique su propia cuenta
        if (Number(req.usuario.id) !== id && req.usuario.rol !== 'administrador') {
            return res.status(403).json({
                error: 'No tenés permisos para modificar esta cuenta'
            });
        }

          //Actualizar el usuario
        const usuario = await usuarioModel.actualizar(id, req.body);

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Usuario actualizado correctamente',
            usuario
        });
    } catch (error) {
        if (error.message === 'El email no puede estar vacío' ||
            error.message === 'La contraseña no puede estar vacía' ||
            error.message === 'No se enviaron campos para modificar') {
            return res.status(400).json({
                error: error.message
            });
        }

        // Email duplicado: restricción UNIQUE de PostgreSQL
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Ese email ya está registrado'
            });
        }

        console.error('Error al actualizar usuario:', error.message);

        res.status(500).json({
            error: 'Error interno al actualizar el usuario'
        });
    }
});

//ELIMINAR USUARIO
app.delete('/api/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        // Verificar permisos antes de eliminar
        if (req.usuario.id !== id && req.usuario.rol !== 'administrador') {
            return res.status(403).json({
                error: 'No tenés permisos para eliminar esta cuenta'
            });
        }

        const usuario = await usuarioModel.eliminar(id);

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Usuario eliminado correctamente',
            usuario
        });
    } catch (error) {
        // PostgreSQL: la cuenta está referenciada por otra tabla
        if (error.code === '23503') {
            return res.status(409).json({
                error: 'No se puede eliminar el usuario porque tiene datos relacionados'
            });
        }

        console.error('Error al eliminar usuario:', error.message);

        res.status(500).json({
            error: 'Error interno al eliminar el usuario'
        });
    }
});


//==========LOGIN=============
/* INICIAR SESIÓN */
app.post('/api/usuario/login', async (req, res) => {
    try {

        // Validar que el cuerpo sea un objeto
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                error: 'Debés enviar los datos en formato JSON'
            });
        }

        const { email, contrasena } = req.body;

        // Validar que se hayan enviado los datos
        if (!email || !contrasena) {
            return res.status(400).json({
                error: 'El email y la contraseña son obligatorios'
            });
        }

        // Buscar el usuario por email
        const usuario = await usuarioModel.obtenerPorEmail(email);
        
        // Comprobar que exista y que la contraseña sea correcta
        if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
            return res.status(401).json({
                error: 'Email o contraseña incorrectos'
            });
        }

        // Generar el token de acceso
        const token = jwt.sign(
            {
                id: usuario.id,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Responder sin exponer el hash de la contraseña
        res.status(200).json({
            mensaje: 'Inicio de sesión correcto',
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);

        res.status(500).json({
            error: 'Error interno al iniciar sesión'
        });
    }
});

//======== RESTAURANTE =========
//GET para traer todos los restaurantes
app.get('/api/restaurantes', async (req, res) => {
    try {
         const { categoria, abierto } = req.query;

        // Validar el filtro abierto
        if (abierto !== undefined && abierto !== 'true' && abierto !== 'false') {
            return res.status(400).json({
                error: 'El filtro abierto debe ser true o false'
            });
        }

        // Validar categoría si fue enviada
        if (categoria !== undefined && (typeof categoria !== 'string' || categoria.trim() === '')) {
            return res.status(400).json({
                error: 'La categoría debe ser un texto no vacío'
            });
        }

        // Obtener todos o filtrar por categoría
        let restaurantes;

        if (categoria !== undefined) {
            restaurantes = await restauranteModel.obtenerPorCategoria(categoria.trim());
        } else {
            restaurantes = await restauranteModel.obtenerTodos();
        }

        // Filtrar por estado abierto/cerrado si se solicitó
        if (abierto !== undefined) {
            const restaurantesConEstado = await Promise.all(
                restaurantes.map(async (restaurante) => {
                    const estado = await horarioRestauranteModel.obtenerEstadoRestaurante(restaurante.id);
                    return {
                        ...restaurante,
                        abierto: estado.abierto
                    };
                })
            );

            restaurantes = restaurantesConEstado.filter(
                restaurante => restaurante.abierto === (abierto === 'true')
            );
        }

        return res.status(200).json(restaurantes);

        /* const restaurantes = await restauranteModel.obtenerTodos();
        res.status(200).json(restaurantes); */

    } catch (error) {
        console.error('Error al obtener restaurantes:', error.message);
        res.status(500).json({
            error: 'Error al obtener los restaurantes'
        });
    }
});
//GET para traer un restaurante
app.get('/api/restaurantes/:id', async (req,res)=>{
   try{
        const id = Number(req.params.id);

        // Validar que el ID sea un número entero positivo
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const restaurante = await restauranteModel.obtenerPorId(id);
        if(!restaurante){
            return res.status(404).json({
                error: 'Restaurante no encontrado'
            });
        }
        res.status(200).json(restaurante);
    }catch(error){
        console.error('Error al buscar el restaurante: ', error.message);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

//POST para crear un restaurante
app.post('/api/restaurantes', verificarToken, async (req, res) => {
    try{
        // Validar el formato de los datos recibidos
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                error: 'Debés enviar los datos del restaurante en formato JSON'
            });
        }

        const restaurante = req.body;

        if(!restaurante.nombre || !restaurante.cuit || !restaurante.categoria){
            return res.status(400).json({
                error:'Faltan datos obligatorios para el restaurante'
            });
        }

        // El ID se obtiene del token, no del cuerpo enviado
        restaurante.id_usuario = req.usuario.id;
        //------------
        const nuevoRestaurante= await restauranteModel.crear(restaurante);
        
        res.status(201).json({
            mensaje: 'Restaurante creado con exito',
            restaurante: nuevoRestaurante
        });
    } catch (error) {
        if (error.message === 'Faltan datos obligatorios para el restaurante') {
            return res.status(400).json({
                error: error.message
            });
        }

        // Error de dato duplicado (restricción UNIQUE)
        if (error.code === '23505') {

            // El CUIT ya pertenece a otro restaurante
            if (error.constraint === 'uq_restaurante_cuit') {
                return res.status(409).json({
                    error: 'Ese CUIT ya está registrado'
                });
            }

            // La cuenta ya tiene un perfil de restaurante
            if (error.constraint === 'uq_restaurante_usuario') {
                return res.status(409).json({
                    error: 'Esta cuenta ya tiene un perfil de restaurante'
                });
            }
        }

        // El usuario no existe
        if (error.message === 'El usuario no existe') {
            return res.status(404).json({
                error: error.message
            });
        }

        // La cuenta no tiene el rol de restaurante
        if (
            error.message ===
            'Solo los usuarios con rol restaurante pueden crear un perfil de restaurante'
        ) {
            return res.status(403).json({
                error: error.message
            });
        }

        // El usuario o algún otro dato relacionado no existe
        if (error.code === '23503') {
            return res.status(400).json({
                error: 'El usuario indicado no existe'
            });
        }

        console.error('Error al crear el restaurante:', error.message);

        return res.status(500).json({
            error: 'Error interno al crear el restaurante'
        });
    }
});

//PUT para modificar un restaurante
app.put('/api/restaurantes/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const restaurante = req.body;

        //verifica id(num)
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        //verifica formato JSON
        if (!restaurante || typeof restaurante !== 'object' || Array.isArray(restaurante)) {
            return res.status(400).json({
                error: 'Debés enviar los datos del restaurante en formato JSON'
            });
        }

        if (!restaurante.nombre ||!restaurante.cuit ||!restaurante.categoria) {
            return res.status(400).json({
                error: 'Faltan datos obligatorios para actualizar el restaurante'
            });
        }

        // Verificamos permiso: que el usuario sea dueño del restaurante o administrador.
        // Buscamos el restaurante que se quiere modificar
        const restauranteExistente = await restauranteModel.obtenerPorId(id);

        if (!restauranteExistente) {
            return res.status(404).json({
                error: 'Restaurante no encontrado'
            });
        }

        // Verificamos que el usuario sea el dueño o administrador
        if (Number(req.usuario.id) !== Number(restauranteExistente.id_usuario) && req.usuario.rol !== 'administrador'){
            return res.status(403).json({
                error: 'No tenés permisos para modificar este restaurante'
            });
        }

        //----------------------------------
        const restauranteActualizado = await restauranteModel.actualizar(
            id,
            restaurante
        );

        if (!restauranteActualizado) {
            return res.status(404).json({
                error: 'Restaurante no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Restaurante actualizado con éxito',
            restaurante: restauranteActualizado
        });
    } catch (error) {
        console.error('Error al actualizar el restaurante:', error.message);

        res.status(500).json({
            error: 'Error interno al actualizar el restaurante'
        });
    }
});

//DELETE para eliminar un restaurante
app.delete('/api/restaurantes/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        //verifica id(num)
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        // Verificar permiso: Buscar el restaurante
        const restauranteExistente = await restauranteModel.obtenerPorId(id);

        if (!restauranteExistente) {
            return res.status(404).json({
                error: 'Restaurante no encontrado'
            });
        }

        // Verificar permisos antes de eliminar
        if (Number(req.usuario.id) !== Number(restauranteExistente.id_usuario) && req.usuario.rol !== 'administrador') {
            return res.status(403).json({
                error: 'No tenés permisos para eliminar este restaurante'
            });
        }

        const restauranteEliminado = await restauranteModel.eliminar(id);

        if (!restauranteEliminado) {
            return res.status(404).json({
                error: 'Restaurante no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Restaurante eliminado con éxito',
            restaurante: restauranteEliminado
        });
    } catch (error) {
        console.error('Error al eliminar el restaurante:', error.message);

        res.status(500).json({
            error: 'Error interno al eliminar el restaurante'
        });
    }
});

//SUBIR IMAGEN RESTAURANTE
app.patch('/api/restaurantes/:id/imagen',verificarToken,subirImagen.single('imagen'),async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    error: 'El ID debe ser un número entero positivo'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    error: 'Debés seleccionar una imagen JPG, PNG o WEBP'
                });
            }

            const restauranteExistente =await restauranteModel.obtenerPorId(id);

            if (!restauranteExistente) {
                return res.status(404).json({
                    error: 'Restaurante no encontrado'
                });
            }

            if (Number(req.usuario.id) !== Number(restauranteExistente.id_usuario) && req.usuario.rol !== 'administrador'
            ) {
                return res.status(403).json({
                    error: 'No tenés permisos para modificar este restaurante'
                });
            }

            const resultadoCloudinary = await new Promise(
                (resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'ecobite/restaurantes',
                            resource_type: 'image'
                        },
                        (error, resultado) => {
                            if (error) {
                                return reject(error);
                            }
                            resolve(resultado);
                        }
                    );
                    Readable.from(req.file.buffer).pipe(stream);
                }
            );

            const restauranteActualizado =await restauranteModel.actualizarImagen(
                    id,
                    resultadoCloudinary.secure_url
                );

            if (!restauranteActualizado) {
                return res.status(404).json({
                    error: 'Restaurante no encontrado'
                });
            }

            // Eliminar la imagen anterior de Cloudinary, si existía
            if (restauranteExistente.imagen && restauranteExistente.imagen !== resultadoCloudinary.secure_url
            ) {
                const publicIdAnterior = obtenerPublicIdDesdeUrl(
                    restauranteExistente.imagen
                );

                if (publicIdAnterior) {
                    try {
                        const resultadoEliminacion = await cloudinary.uploader.destroy(
                            publicIdAnterior,
                            {
                                resource_type: 'image',
                                type: 'upload',
                                invalidate: true
                            }
                        );
                        console.log('Resultado de eliminación:', resultadoEliminacion);
                    } catch (error) {
                        console.error('Error al eliminar imagen:', error);
                    }
                }

                /* if (publicIdAnterior) {
                    try {
                        await cloudinary.uploader.destroy(publicIdAnterior, {
                            resource_type: 'image'
                        });
                    } catch (error) {
                        console.error(
                            'No se pudo eliminar la imagen anterior del restaurante:',
                            error.message
                        );
                    }
                } */
            }
            //--
            return res.status(200).json({
                mensaje: 'Imagen del restaurante actualizada correctamente',
                imagen: restauranteActualizado.imagen
            });

        } catch (error) {
            console.error('Error al subir la imagen del restaurante:', error.message);

            return res.status(500).json({
                error: 'Error interno al subir la imagen'
            });
        }
    }
);

//======== PRODUCTOS =========
// OBTENER PRODUCTOS DE UN RESTAURANTE
app.get('/api/restaurantes/:id/productos', async (req, res) => {
    try {
        const idRestaurante = Number(req.params.id);
        const { categoria } = req.query;

        if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
            return res.status(400).json({
                error: 'El ID del restaurante debe ser un número entero positivo'
            });
        }

        if (categoria !== undefined && (typeof categoria !== 'string' || categoria.trim() === '')) {
            return res.status(400).json({
                error: 'La categoría debe ser un texto no vacío'
            });
        }

        const restaurante = await restauranteModel.obtenerPorId(idRestaurante);

        if (!restaurante) {
            return res.status(404).json({
                error: 'Restaurante no encontrado'
            });
        }

        const productos = await productoModel.obtenerPorRestaurante(idRestaurante,
                categoria === undefined ? null : categoria.trim());

        return res.status(200).json({
            restaurante_id: idRestaurante,
            productos
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error.message);

        return res.status(500).json({
            error: 'Error interno al obtener los productos'
        });
    }
});

// CREAR PRODUCTO DE UN RESTAURANTE
app.post('/api/productos', verificarToken, async (req, res) => {
    try {
        // Validar el cuerpo recibido
        const datos = req.body;

        if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
            return res.status(400).json({
                error: 'Debés enviar los datos en formato JSON'
            });
        }

        // Obtener los datos enviados
        const {
            id_restaurante,
            nombre,
            descripcion,
            precio,
            categoria
        } = req.body;

        // Validar los campos obligatorios
        if (
            !id_restaurante ||
            !nombre ||
            precio === undefined ||
            precio === null ||
            !categoria
        ) {
            return res.status(400).json({
                mensaje: 'Faltan campos obligatorios: id_restaurante, nombre, precio y categoria'
            });
        }

        // Validar el ID del restaurante
        if (!Number.isInteger(id_restaurante) || id_restaurante <= 0) {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'id_restaurante debe ser un número entero positivo'
            });
        }

        // Validar el nombre
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'nombre debe ser un texto no vacío'
            });
        }

        // Validar la descripción
        if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'descripcion debe ser un texto o null'
            });
        }

        // Validar el precio
        if (typeof precio !== 'number' || !Number.isFinite(precio) || precio <= 0) {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'precio debe ser un número mayor que cero, sin comillas'
            });
        }

        // Validar la categoría
        if (typeof categoria !== 'string' || categoria.trim() === '') {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'categoria debe ser un texto no vacío'
            });
        }

        // Verificar que el restaurante exista
        const restaurante = await restauranteModel.obtenerPorId(id_restaurante);

        if (!restaurante) {
            return res.status(404).json({
                mensaje: 'Restaurante no encontrado'
            });
        }

        // Verificar que el usuario sea dueño o administrador
        if (
            req.usuario.rol !== 'admin' &&
            restaurante.id_usuario !== req.usuario.id
        ) {
            return res.status(403).json({
                mensaje: 'No tenés permiso para crear productos en este restaurante'
            });
        }

        // Crear el producto
        const nuevoProducto = await productoModel.crear({
            id_restaurante,
            nombre,
            descripcion,
            precio,
            categoria
        });

        return res.status(201).json({
            mensaje: 'Producto creado correctamente',
            producto: nuevoProducto
        });

    } catch (error) {
        console.error('Error al crear producto:', error);

        return res.status(500).json({
            mensaje: 'Error interno al crear el producto'
        });
    }
});

// SUBIR O ACTUALIZAR IMAGEN DE UN PRODUCTO
app.patch('/api/productos/:id/imagen',verificarToken,subirImagen.single('imagen'),async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    error: 'El ID debe ser un número entero positivo'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    error: 'Debés seleccionar una imagen JPG, PNG o WEBP'
                });
            }

            // Buscar el producto mediante su modelo
            const productoExistente = await productoModel.obtenerPorId(id);

            if (!productoExistente) {
                return res.status(404).json({
                    error: 'Producto no encontrado'
                });
            }

            // Buscar el restaurante propietario del producto
            const restauranteExistente = await restauranteModel.obtenerPorId(
                productoExistente.id_restaurante
            );

            if (!restauranteExistente) {
                return res.status(404).json({
                    error: 'Restaurante no encontrado'
                });
            }

            // Verificar permisos del dueño del restaurante
            if (
                Number(req.usuario.id) !== Number(restauranteExistente.id_usuario) &&
                req.usuario.rol !== 'administrador'
            ) {
                return res.status(403).json({
                    error: 'No tenés permisos para modificar este producto'
                });
            }

            // Subir la imagen a Cloudinary
            const resultadoCloudinary = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'ecobite/productos',
                        resource_type: 'image'
                    },
                    (error, resultado) => {
                        if (error) return reject(error);
                        resolve(resultado);
                    }
                );

                Readable.from(req.file.buffer).pipe(stream);
            });

            // Actualizar la URL mediante el modelo
            const productoActualizado = await productoModel.actualizarImagen(
                id,
                resultadoCloudinary.secure_url
            );

            if (!productoActualizado) {
                return res.status(404).json({
                    error: 'Producto no encontrado'
                });
            }

            // Eliminar la imagen anterior de Cloudinary, si existía
            if (productoExistente.imagen && productoExistente.imagen !== resultadoCloudinary.secure_url
            ) {
                const publicIdAnterior = obtenerPublicIdDesdeUrl(
                    productoExistente.imagen
                );
                
                /* if (publicIdAnterior) {
                    try {
                        await cloudinary.uploader.destroy(publicIdAnterior, {
                            resource_type: 'image'
                        });
                    } catch (error) {
                        console.error(
                            'No se pudo eliminar la imagen anterior del producto:',
                            error.message
                        );
                    }
                } */

                if (publicIdAnterior) {
                    try {
                        const resultadoEliminacion = await cloudinary.uploader.destroy(
                            publicIdAnterior,
                            {
                                resource_type: 'image',
                                type: 'upload',
                                invalidate: true
                            }
                        );
                        console.log('Resultado de eliminación:', resultadoEliminacion);
                    } catch (error) {
                        console.error('Error al eliminar imagen:', error);
                    }
                }
            }
            //--
            return res.status(200).json({
                mensaje: 'Imagen del producto actualizada correctamente',
                producto: productoActualizado
            });

        } catch (error) {
            console.error(
                'Error al subir la imagen del producto:',
                error.message
            );

            return res.status(500).json({
                error: 'Error interno al subir la imagen del producto'
            });
        }
    }
);

//MODIFICAR UN PRODUCTO
app.patch('/api/productos/:id', verificarToken, async (req, res) => {
    try {
        const idProducto = Number(req.params.id);

        if (!Number.isInteger(idProducto) || idProducto <= 0) {
            return res.status(400).json({
               error: 'Dato inválido',
               detalle: 'El ID del producto debe ser un entero positivo'
            });
        }

        // Validar el cuerpo recibido
        const datos = req.body;

        if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
            return res.status(400).json({
                error: 'Debés enviar los datos en formato JSON'
            });
        }

        // Obtener los campos enviados
        const {
            nombre,
            descripcion,
            precio,
            categoria,
            disponible
        } = req.body;

        // Verificar que se haya enviado al menos un campo
        if (Object.keys(datos).length === 0) {
            return res.status(400).json({
                error: 'No se enviaron datos para modificar'
            });
        }

         // Validar los campos enviados
        if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim() === '')) {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'nombre debe ser un texto no vacío'
            });
        }

        if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'descripcion debe ser un texto o null'
            });
        }

        if (precio !== undefined && (typeof precio !== 'number' ||!Number.isFinite(precio) || precio <= 0)) {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'precio debe ser un número mayor que cero, sin comillas'
            });
        }

        if (categoria !== undefined && (typeof categoria !== 'string' || categoria.trim() === '')) {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'categoria debe ser un texto no vacío'
            });
        }

        if (disponible !== undefined && typeof disponible !== 'boolean') {
            return res.status(400).json({
                error: 'Dato inválido',
                detalle: 'disponible debe ser un booleano: true o false, sin comillas'
            });
        }

        // Evitar aceptar campos que no se pueden modificar
        const camposPermitidos = [
            'nombre',
            'descripcion',
            'precio',
            'categoria',
            'disponible'
        ];

        const camposNoPermitidos = Object.keys(datos).filter(
            campo => !camposPermitidos.includes(campo)
        );

        if (camposNoPermitidos.length > 0) {
            return res.status(400).json({
                error: 'Campos no permitidos',
                detalle: `No se pueden modificar estos campos: ${camposNoPermitidos.join(', ')}`
            });
        }

        // Buscar el producto
        const producto = await productoModel.obtenerPorId(idProducto);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        // Buscar el restaurante propietario
        const restaurante = await restauranteModel.obtenerPorId(
            producto.id_restaurante
        );

        if (!restaurante) {
            return res.status(404).json({
                mensaje: 'Restaurante no encontrado'
            });
        }

        // Verificar permisos
        if (
            req.usuario.rol !== 'admin' &&
            restaurante.id_usuario !== req.usuario.id
        ) {
            return res.status(403).json({
                mensaje: 'No tenés permiso para modificar este producto'
            });
        }

        // Actualizar los datos
        const productoActualizado = await productoModel.actualizar(
            idProducto,
            {
                nombre,
                descripcion,
                precio,
                categoria,
                disponible
            }
        );

        return res.status(200).json({
            mensaje: 'Producto actualizado correctamente',
            producto: productoActualizado
        });

    } catch (error) {
        console.error('Error al modificar producto:', error);

        return res.status(500).json({
            mensaje: 'Error interno al modificar el producto'
        });
    }
});

//ELIMINAR PRODUCTO (DISPONIBLE:FALSE)
app.delete('/api/productos/:id', verificarToken, async (req, res) => {
    try {
        const idProducto = Number(req.params.id);

        if (!Number.isInteger(idProducto) || idProducto <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del producto no es válido'
            });
        }

        // Buscar el producto
        const producto = await productoModel.obtenerPorId(idProducto);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        // Buscar el restaurante propietario
        const restaurante = await restauranteModel.obtenerPorId(
            producto.id_restaurante
        );

        if (!restaurante) {
            return res.status(404).json({
                mensaje: 'Restaurante no encontrado'
            });
        }

        // Verificar permisos
        if (
            req.usuario.rol !== 'admin' &&
            restaurante.id_usuario !== req.usuario.id
        ) {
            return res.status(403).json({
                mensaje: 'No tenés permiso para desactivar este producto'
            });
        }

        // Desactivar sin borrar el registro
        const productoDesactivado = await productoModel.eliminar(idProducto);

        return res.status(200).json({
            mensaje: 'Producto desactivado correctamente',
            producto: productoDesactivado
        });

    } catch (error) {
        console.error('Error al desactivar producto:', error);

        return res.status(500).json({
            mensaje: 'Error interno al desactivar el producto'
        });
    }
});

//CONSULTAR TODOS LOS PRODUCTOS ADMIN Y DUEÑO
app.get('/api/restaurantes/:id/productos/gestion',verificarToken,verificarRol('restaurante', 'administrador'),
    async (req, res) => {
        try {
            const idRestaurante = Number(req.params.id);
            const { categoria, disponible } = req.query;

            if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
                return res.status(400).json({
                    error: 'El ID del restaurante debe ser un entero positivo'
                });
            }
            if (categoria !== undefined && (typeof categoria !== 'string' || categoria.trim() === '')) {
                return res.status(400).json({
                    error: 'La categoría debe ser un texto no vacío'
                });
            }

            if (
                disponible !== undefined &&
                disponible !== 'true' &&
                disponible !== 'false'
            ) {
                return res.status(400).json({
                    error: 'El filtro disponible debe ser true o false'
                });
            }

            const restaurante = await restauranteModel.obtenerPorId(idRestaurante);

            if (!restaurante) {
                return res.status(404).json({
                    error: 'Restaurante no encontrado'
                });
            }

            // El restaurante solo puede gestionar sus propios productos.
            // El administrador puede gestionar cualquier restaurante.
            if (req.usuario.rol !== 'administrador' && restaurante.id_usuario !== req.usuario.id) {
                return res.status(403).json({
                    error: 'No tenés permiso para gestionar este restaurante'
                });
            }

            const productos = await productoModel.obtenerFiltradosPorRestaurante(
                    idRestaurante,
                    categoria === undefined ? null : categoria.trim(),
                    disponible === undefined ? null : disponible === 'true'
                );

            return res.status(200).json({
                restaurante_id: idRestaurante,
                productos
            });
        } catch (error) {
            console.error('Error al gestionar productos:', error.message);
            return res.status(500).json({
                error: 'Error al obtener los productos'
            });
        }
    }
);

//============CLIENTE==============
 // CREAR CLIENTE
app.post('/api/clientes', verificarToken, async (req, res) => {
    try {

        // Validar el formato de los datos recibidos
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                error: 'Debés enviar los datos del cliente en formato JSON'
            });
        }

        const cliente = req.body;

        if (!cliente.nombre || !cliente.apellido) {
            return res.status(400).json({
                error: 'Faltan datos obligatorios para el cliente'
            });
        }
        // El ID se obtiene del token, no del cuerpo enviado
        cliente.id_usuario = req.usuario.id;

        const nuevoCliente = await clienteModel.crear(cliente);

        res.status(201).json({
            mensaje: 'Perfil de cliente creado correctamente',
            cliente: nuevoCliente
        });
    } catch (error) {
        if (error.message === 'Faltan datos obligatorios para el cliente') {
            return res.status(400).json({
                error: error.message
            });
        }

        // La cuenta ya tiene un perfil de cliente
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Esta cuenta ya tiene un perfil de cliente'
            });
        }

        // PostgreSQL detectó una referencia inexistente (usuario o zona)
        if (error.code === '23503') {
            return res.status(400).json({
                error: 'El usuario o la zona indicada no existe'
            });
        }
        
        // La consulta previa confirmó que el usuario no existe
        if (error.message === 'El usuario no existe') {
            return res.status(404).json({
                error: error.message
            });
        }

        // La cuenta existe, pero no tiene el rol de cliente
        if (error.message ==='Solo los usuarios con rol cliente pueden crear un perfil de cliente') {
            return res.status(403).json({
                error: error.message
            });
        }

        console.error('Error al crear el cliente:', error.message);

        res.status(500).json({
            error: 'Error interno al crear el cliente'
        });
    }
});

// OBTENER TODOS LOS CLIENTES
app.get('/api/clientes', verificarToken,verificarRol('administrador'),async (req, res) => {
    try {
        const clientes = await clienteModel.obtenerTodos();

        res.status(200).json(clientes);
    } catch (error) {
        console.error('Error al obtener los clientes:', error.message);

        res.status(500).json({
            error: 'Error interno al obtener los clientes'
        });
    }
});


// OBTENER UN CLIENTE POR ID
app.get('/api/clientes/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validar que el ID sea un número entero positivo
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        // Buscar el perfil para comprobar los permisos
        const clienteExistente = await clienteModel.obtenerPorId(id);

        if (!clienteExistente) {
            return res.status(404).json({
                error: 'No se encontró el cliente'
            });
        }

        // Verificar permiso: Solo puede consultar su propio perfil o ser administrador
        if (Number(req.usuario.id) !== Number(clienteExistente.id_usuario) && req.usuario.rol !== 'administrador') {
            return res.status(403).json({
                error: 'No tenés permisos para consultar este perfil'
            });
        }
        res.status(200).json(clienteExistente);

    } catch (error) {
        console.error('Error al obtener el cliente:', error.message);

        res.status(500).json({
            error: 'Error interno al obtener el cliente'
        });
    }
});

// ACTUALIZAR PERFIL DE CLIENTE
app.put('/api/clientes/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validar el ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const datos = req.body;

        // Validar que el cuerpo sea un objeto
        if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
            return res.status(400).json({
                error: 'Debés enviar los datos del cliente en formato JSON'
            });
        }

        // Verificar que se envíen datos
        if (Object.keys(datos).length === 0) {
            return res.status(400).json({
                error: 'Debe enviar al menos un dato para actualizar'
            });
        }

        // Verificar permiso: Buscar el perfil para comprobar los permisos
        const clienteExistente = await clienteModel.obtenerPorId(id);

        if (!clienteExistente) {
            return res.status(404).json({
                error: 'No se encontró el cliente'
            });
        }

        // Verificar que sea el dueño o administrador
        if (Number(req.usuario.id) !== Number(clienteExistente.id_usuario) && req.usuario.rol !== 'administrador') {
            return res.status(403).json({
                error: 'No tenés permisos para modificar este perfil'
            });
        }
        //----------
        const clienteActualizado = await clienteModel.actualizar(id, datos);

        // Verificar que el perfil exista
        if (!clienteActualizado) {
            return res.status(404).json({
                error: 'No se encontró el cliente'
            });
        }

        res.status(200).json({
            mensaje: 'Perfil de cliente actualizado correctamente',
            cliente: clienteActualizado
        });

    } catch (error) {
        if (error.message === 'El nombre y el apellido no pueden estar vacíos' ) {
            return res.status(400).json({
                error: error.message
            });
        }

        if (error.code === '23503') {
            return res.status(400).json({
                error: 'La zona indicada no existe'
            });
        }

        console.error('Error al actualizar el cliente:', error.message);

        res.status(500).json({
            error: 'Error interno al actualizar el cliente'
        });
    }
});

 // ELIMINAR PERFIL DE CLIENTE
app.delete('/api/clientes/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validar el ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        // Verificar permiso: Buscar el perfil para comprobar los permisos
        const clienteExistente = await clienteModel.obtenerPorId(id);

        if (!clienteExistente) {
            return res.status(404).json({
                error: 'No se encontró el cliente'
            });
        }

        // Verificar que sea el dueño o administrador
        if (Number(req.usuario.id) !== Number(clienteExistente.id_usuario) && req.usuario.rol !== 'administrador') {
            return res.status(403).json({
                error: 'No tenés permisos para eliminar este perfil'
            });
        }

        // Eliminar el perfil
        const clienteEliminado = await clienteModel.eliminar(id);

        // Verificar si el perfil existía
        if (!clienteEliminado) {
            return res.status(404).json({
                error: 'No se encontró el cliente'
            });
        }

        // Responder con éxito
        res.status(200).json({
            mensaje: 'Perfil de cliente eliminado correctamente',
            cliente: clienteEliminado
        });

    } catch (error) {
        // El perfil tiene pedidos asociados u otra referencia
        if (error.code === '23503') {
            return res.status(409).json({
                error: 'No se puede eliminar el cliente porque tiene registros asociados'
            });
        }

        console.error('Error al eliminar el cliente:', error.message);

        res.status(500).json({
            error: 'Error interno al eliminar el cliente'
        });
    }
});

//HORARIOS RESTAURANTES

//Guardar la configuración semanal completa.
app.post('/api/restaurantes/:id/horarios',verificarToken,verificarRol('restaurante', 'administrador'),
    async (req, res) => {
        try {
            // 1. Validar que el ID sea un número entero positivo
            const idRestaurante = Number(req.params.id);

            if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
                return res.status(400).json({
                    error: 'El ID del restaurante debe ser un número entero positivo'
                });
            }

            // 2. Validar que el cuerpo sea un objeto JSON
            if (!req.body ||typeof req.body !== 'object' || Array.isArray(req.body)) {
                return res.status(400).json({
                    error: 'Debés enviar los datos en formato JSON'
                });
            }

            // 3. Validar la lista de horarios
            const { horarios } = req.body;

            if (!Array.isArray(horarios) || horarios.length === 0) {
                return res.status(400).json({
                    error: 'Debés enviar al menos un horario'
                });
            }

            // 4. Validar todos los turnos antes de guardar
            const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

            for (const horario of horarios) {
                if (!horario ||typeof horario !== 'object' || Array.isArray(horario)) {
                    return res.status(400).json({
                        error: 'Cada horario debe ser un objeto válido'
                    });
                }

                const { dia_semana, hora_apertura, hora_cierre } = horario;

                if (!Number.isInteger(dia_semana) || dia_semana < 1 || dia_semana > 7) {
                    return res.status(400).json({
                        error: 'El día debe ser un número del 1 al 7'
                    });
                }

                if (typeof hora_apertura !== 'string' ||!formatoHora.test(hora_apertura) ||typeof hora_cierre !== 'string' ||
                    !formatoHora.test(hora_cierre)) {
                    return res.status(400).json({
                        error: 'Las horas deben tener el formato HH:MM'
                    });
                }

                if (hora_apertura === hora_cierre) {
                    return res.status(400).json({
                        error: 'La apertura y el cierre no pueden ser iguales'
                    });
                }
            }

            // Validar que los turnos no se superpongan y que haya como máximo dos turnos por día
            const horariosPorDia = {};

            for (const horario of horarios) {
                if (!horariosPorDia[horario.dia_semana]) {
                    horariosPorDia[horario.dia_semana] = [];
                }

                horariosPorDia[horario.dia_semana].push(horario);
            }

            for (const turnos of Object.values(horariosPorDia)) {
                if (turnos.length > 2) {
                    return res.status(400).json({
                        error: 'No se permiten más de dos turnos por día'
                    });
                }

                turnos.sort((a, b) => a.hora_apertura.localeCompare(b.hora_apertura) );

                for (let i = 1; i < turnos.length; i++) {
                    if (turnos[i].hora_apertura < turnos[i - 1].hora_cierre) {
                        return res.status(400).json({
                            error: 'Los horarios de un mismo día no pueden superponerse'
                        });
                    }
                }
            }

            // 5. Comprobar que el restaurante exista
            const restaurante = await horarioRestauranteModel.obtenerRestaurante(idRestaurante);

            if (!restaurante) {
                return res.status(404).json({
                    error: 'No se encontró el restaurante'
                });
            }

            // 6. Comprobar los permisos del usuario autenticado
            if ( req.usuario.rol !== 'administrador' && Number(restaurante.id_usuario) !== Number(req.usuario.id)) {
                return res.status(403).json({
                    error: 'No tenés permiso para modificar los horarios de este restaurante'
                });
            }

            // 7. Guardar los turnos
            const horariosGuardados = await horarioRestauranteModel.reemplazarPorRestaurante(
                idRestaurante,
                horarios
            );

            return res.status(200).json({
                mensaje: 'Horarios registrados correctamente',
                horarios: horariosGuardados
            });
        } catch (error) {
            console.error('Error al registrar horarios:', error.message);

            return res.status(500).json({
                error: 'Error interno al registrar los horarios'
            });
        }
    }
);

//Ver todos los turnos del restaurante.
app.get('/api/restaurantes/:id/horarios',verificarToken,verificarRol('restaurante', 'administrador'),async (req, res) => {
        try {
            // 1. Validar el ID
            const idRestaurante = Number(req.params.id);

            if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
                return res.status(400).json({
                    error: 'El ID del restaurante debe ser un número entero positivo'
                });
            }

            // 2. Comprobar que exista el restaurante
            const restaurante = await horarioRestauranteModel.obtenerRestaurante(idRestaurante);

            if (!restaurante) {
                return res.status(404).json({
                    error: 'No se encontró el restaurante'
                });
            }

            // 3. Verificar permisos
            if (req.usuario.rol !== 'administrador' && Number(restaurante.id_usuario) !== Number(req.usuario.id)) {
                return res.status(403).json({
                    error: 'No tenés permiso para consultar los horarios de este restaurante'
                });
            }

            // 4. Consultar horarios
            const horarios = await horarioRestauranteModel.obtenerPorRestaurante(idRestaurante);

            return res.status(200).json({
                restaurante_id: idRestaurante,
                horarios
            });
        } catch (error) {
            console.error('Error al consultar horarios:', error.message);

            return res.status(500).json({
                error: 'Error interno al consultar los horarios'
            });
        }
    }
);

//MODIFICAR UN HORARIO
app.put('/api/restaurantes/:id/horarios/:idHorario',verificarToken,verificarRol('restaurante', 'administrador'),async (req, res) => {
        try {
            const idRestaurante = Number(req.params.id);
            const idHorario = Number(req.params.idHorario);

            if (!Number.isInteger(idRestaurante) || idRestaurante <= 0 ||!Number.isInteger(idHorario) || idHorario <= 0) {
                return res.status(400).json({
                    error: 'Los IDs deben ser enteros positivos'
                });
            }

            const { dia_semana, hora_apertura, hora_cierre } = req.body;

            const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

            if (!Number.isInteger(dia_semana) || dia_semana < 1 || dia_semana > 7) {
                return res.status(400).json({
                    error: 'El día debe ser un número del 1 al 7'
                });
            }

            if (typeof hora_apertura !== 'string' ||!formatoHora.test(hora_apertura) || typeof hora_cierre !== 'string' ||
                !formatoHora.test(hora_cierre)) {
                return res.status(400).json({
                    error: 'Las horas deben tener el formato HH:MM'
                });
            }

            if (hora_apertura >= hora_cierre) {
                return res.status(400).json({
                    error: 'La apertura debe ser anterior al cierre'
                });
            }

            const restaurante = await horarioRestauranteModel.obtenerRestaurante(idRestaurante);

            if (!restaurante) {
                return res.status(404).json({
                    error: 'No se encontró el restaurante'
                });
            }

            if (req.usuario.rol !== 'administrador' && Number(restaurante.id_usuario) !== Number(req.usuario.id)) {
                return res.status(403).json({
                    error: 'No tenés permiso para modificar estos horarios'
                });
            }

            const horarios = await horarioRestauranteModel.obtenerPorRestaurante(idRestaurante);

            const horarioActual = horarios.find( h => Number(h.id) === idHorario );

            if (!horarioActual) {
                return res.status(404).json({
                    error: 'No se encontró ese horario en el restaurante'
                });
            }

            const otrosTurnosDelDia = horarios.filter( h =>
                    Number(h.id) !== idHorario &&
                    Number(h.dia_semana) === dia_semana
            );

            if (otrosTurnosDelDia.length >= 2) {
                return res.status(400).json({
                    error: 'No se permiten más de dos turnos por día'
                });
            }

            const seSuperpone = otrosTurnosDelDia.some(h => {
                const aperturaExistente = String(h.hora_apertura).slice(0, 5);
                const cierreExistente = String(h.hora_cierre).slice(0, 5);

                return (
                    hora_apertura < cierreExistente &&
                    hora_cierre > aperturaExistente
                );
            });

            if (seSuperpone) {
                return res.status(400).json({
                    error: 'Los horarios de un mismo día no pueden superponerse'
                });
            }

            const horarioActualizado =
                await horarioRestauranteModel.actualizar(
                    idRestaurante,
                    idHorario,
                    dia_semana,
                    hora_apertura,
                    hora_cierre
                );

            return res.status(200).json({
                mensaje: 'Horario actualizado correctamente',
                horario: horarioActualizado
            });

        } catch (error) {
            console.error('Error al actualizar horario:', error.message);
            return res.status(500).json({
                error: 'Error interno al actualizar el horario'
            });
        }
    }
);

//ELIMINAR UN HORARIO

app.delete('/api/restaurantes/:id/horarios/:idHorario',verificarToken,verificarRol('restaurante', 'administrador'),
    async (req, res) => {
        try {
            const idRestaurante = Number(req.params.id);
            const idHorario = Number(req.params.idHorario);

            if (!Number.isInteger(idRestaurante) || idRestaurante <= 0 ||!Number.isInteger(idHorario) || idHorario <= 0
            ) {
                return res.status(400).json({
                    error: 'Los IDs deben ser enteros positivos'
                });
            }

            const restaurante = await horarioRestauranteModel.obtenerRestaurante(idRestaurante);

            if (!restaurante) {
                return res.status(404).json({
                    error: 'No se encontró el restaurante'
                });
            }

            if (req.usuario.rol !== 'administrador' && Number(restaurante.id_usuario) !== Number(req.usuario.id)
            ) {
                return res.status(403).json({
                    error: 'No tenés permiso para eliminar estos horarios'
                });
            }

            const horarioEliminado = await horarioRestauranteModel.eliminar(idRestaurante, idHorario);

            if (!horarioEliminado) {
                return res.status(404).json({
                    error: 'No se encontró ese horario en el restaurante'
                });
            }

            return res.status(200).json({
                mensaje: 'Horario eliminado correctamente',
                horario: horarioEliminado
            });

        } catch (error) {
            console.error('Error al eliminar horario:', error.message);
            return res.status(500).json({
                error: 'Error interno al eliminar el horario'
            });
        }
    }
);
//AGREGAR UN HORARIO
app.post('/api/restaurantes/:id/horarios/turno', verificarToken, verificarRol('restaurante', 'administrador'),
    async (req, res) => {
        try {
            const idRestaurante = Number(req.params.id);

            if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
                return res.status(400).json({
                    error: 'El ID del restaurante debe ser un entero positivo'
                });
            }

            const { dia_semana, hora_apertura, hora_cierre } = req.body;
            const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

            if (!Number.isInteger(dia_semana) || dia_semana < 1 || dia_semana > 7) {
                return res.status(400).json({
                    error: 'El día debe ser un número del 1 al 7'
                });
            }

            if (typeof hora_apertura !== 'string' ||!formatoHora.test(hora_apertura) ||typeof hora_cierre !== 'string' ||
                !formatoHora.test(hora_cierre)) {
                return res.status(400).json({
                    error: 'Las horas deben tener el formato HH:MM'
                });
            }

            if (hora_apertura >= hora_cierre) {
                return res.status(400).json({
                    error: 'La apertura debe ser anterior al cierre'
                });
            }

            const restaurante = await horarioRestauranteModel.obtenerRestaurante(idRestaurante);

            if (!restaurante) {
                return res.status(404).json({
                    error: 'No se encontró el restaurante'
                });
            }

            if (req.usuario.rol !== 'administrador' && Number(restaurante.id_usuario) !== Number(req.usuario.id)) {
                return res.status(403).json({
                    error: 'No tenés permiso para modificar estos horarios'
                });
            }

            const horarios = await horarioRestauranteModel.obtenerPorRestaurante(idRestaurante);

            const turnosDelDia = horarios.filter(
                h => Number(h.dia_semana) === dia_semana
            );

            if (turnosDelDia.length >= 2) {
                return res.status(400).json({
                    error: 'No se permiten más de dos turnos por día'
                });
            }

            const seSuperpone = turnosDelDia.some(h => {
                const aperturaExistente = String(h.hora_apertura).slice(0, 5);
                const cierreExistente = String(h.hora_cierre).slice(0, 5);

                return (
                    hora_apertura < cierreExistente &&
                    hora_cierre > aperturaExistente
                );
            });

            if (seSuperpone) {
                return res.status(400).json({
                    error: 'Los horarios de un mismo día no pueden superponerse'
                });
            }

            const nuevoTurno = await horarioRestauranteModel.agregarTurno(
                idRestaurante,
                dia_semana,
                hora_apertura,
                hora_cierre
            );

            return res.status(201).json({
                mensaje: 'Turno agregado correctamente',
                horario: nuevoTurno
            });

        } catch (error) {
            console.error('Error al agregar turno:', error.message);
            return res.status(500).json({
                error: 'Error interno al agregar el turno'
            });
        }
    }
);


//CAMBIAR ESTADO (ABIERTO/CERRADO)RESTAURANTE
app.get('/api/restaurantes/:id/estado', async (req, res) => {
    try {
        const idRestaurante = Number(req.params.id);

        if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
            return res.status(400).json({
                error: 'El ID del restaurante debe ser un número entero positivo'
            });
        }

        const restaurante = await horarioRestauranteModel.obtenerRestaurante(idRestaurante);

        if (!restaurante) {
            return res.status(404).json({
                error: 'No se encontró el restaurante'
            });
        }

        const estado = await horarioRestauranteModel.obtenerEstadoRestaurante(idRestaurante);

        return res.status(200).json({
            restaurante_id: idRestaurante,
            ...estado
        });
    } catch (error) {
        console.error('Error al consultar el estado del restaurante:', error.message);

        return res.status(500).json({
            error: 'Error interno al consultar el estado del restaurante'
        });
    }
});


 //============ PEDIDOS ============

// CREAR PEDIDO
app.post('/api/ordenes',verificarToken,verificarRol('cliente'),async (req, res) => {
        try {
            // 1. Validar que el cuerpo sea un objeto JSON
            if (
                !req.body ||
                typeof req.body !== 'object' ||
                Array.isArray(req.body)
            ) {
                return res.status(400).json({
                    error: 'Debés enviar los datos del pedido en formato JSON'
                });
            }

            const {
                id_restaurante,
                id_zona,
                productos,
                tipo_pago,
                costo_envio
            } = req.body;

            // 2. Validar los IDs
            if (!Number.isInteger(id_restaurante) || id_restaurante <= 0 || !Number.isInteger(id_zona) ||
                id_zona <= 0) {
                return res.status(400).json({
                    error: 'El restaurante y la zona deben tener IDs enteros positivos'
                });
            }

            // 3. Validar el medio de pago
            if (!['efectivo', 'tarjeta'].includes(tipo_pago)) {
                return res.status(400).json({
                    error: 'El tipo de pago debe ser efectivo o tarjeta'
                });
            }

            // 4. Validar los productos del carrito
            if (!Array.isArray(productos) || productos.length === 0) {
                return res.status(400).json({
                    error: 'El carrito debe contener al menos un producto'
                });
            }

            for (const producto of productos) {
                if (
                    !producto ||
                    !Number.isInteger(producto.id_producto) ||
                    producto.id_producto <= 0 ||
                    !Number.isInteger(producto.cantidad) ||
                    producto.cantidad <= 0
                ) {
                    return res.status(400).json({
                        error: 'Cada producto debe tener un ID válido y una cantidad entera positiva'
                    });
                }
            }

            // Evitar que un mismo producto aparezca repetido
            const idsProductos = productos.map(producto => producto.id_producto);

            if (new Set(idsProductos).size !== idsProductos.length) {
                return res.status(400).json({
                    error: 'No repitas productos en el carrito; indicá su cantidad en una sola línea'
                });
            }

            // 5. Validar el costo de envío si fue enviado
            if (
                costo_envio !== undefined &&
                (
                    typeof costo_envio !== 'number' ||
                    !Number.isFinite(costo_envio) ||
                    costo_envio < 0
                )
            ) {
                return res.status(400).json({
                    error: 'El costo de envío debe ser un número mayor o igual a cero'
                });
            }

            // 6. Crear el pedido
            // El ID del usuario sale del token, no del body
            const nuevoPedido = await pedidoModel.crear({
                ...req.body,
                id_usuario: req.usuario.id
            });

            return res.status(201).json({
                mensaje: 'Pedido creado correctamente',
                pedido: nuevoPedido
            });

        } catch (error) {
            // Errores de validación del modelo
            const erroresValidacion = [
                'El usuario no tiene un perfil de cliente',
                'El restaurante no existe',
                'La zona no existe',
                'Hay productos que no existen, no están disponibles o no pertenecen al restaurante'
            ];

            if (erroresValidacion.includes(error.message)) {
                const estadoHTTP =
                    error.message === 'El usuario no tiene un perfil de cliente' ||
                    error.message === 'El restaurante no existe' ||
                    error.message === 'La zona no existe'
                        ? 404
                        : 400;

                return res.status(estadoHTTP).json({
                    error: error.message
                });
            }

            // Error de clave foránea en PostgreSQL
            if (error.code === '23503') {
                return res.status(400).json({
                    error: 'Alguna referencia del pedido no es válida'
                });
            }

            console.error('Error al crear el pedido:', error.message);

            return res.status(500).json({
                error: 'Error interno al crear el pedido'
            });
        }
    }
);


 // ACEPTAR PEDIDO
app.patch('/api/ordenes/:id/aceptar',verificarToken,verificarRol('restaurante'),async (req, res) => {
        try {
            const idPedido = Number(req.params.id);

            if (!Number.isInteger(idPedido) || idPedido <= 0) {
                return res.status(400).json({
                    error: 'El ID del pedido debe ser un entero positivo'
                });
            }

            const pedido = await pedidoModel.aceptarPedido(
                idPedido,
                req.usuario.id
            );

            if (!pedido) {
                return res.status(404).json({
                    error: 'El pedido no existe, no pertenece a tu restaurante o ya no está pendiente'
                });
            }

            return res.status(200).json({
                mensaje: 'Pedido aceptado correctamente',
                pedido
            });
        } catch (error) {
            console.error('Error al aceptar el pedido:', error.message);

            return res.status(500).json({
                error: 'Error interno al aceptar el pedido'
            });
        }
    }
);

 // DESPACHAR PEDIDO
app.patch('/api/ordenes/:id/despachar',verificarToken,verificarRol('restaurante'),async (req, res) => {
        try {
            const idPedido = Number(req.params.id);

            if (!Number.isInteger(idPedido) || idPedido <= 0) {
                return res.status(400).json({
                    error: 'El ID del pedido debe ser un entero positivo'
                });
            }

            const pedido = await pedidoModel.despacharPedido(
                idPedido,
                req.usuario.id
            );

            if (!pedido) {
                return res.status(404).json({
                    error: 'El pedido no existe, no pertenece a tu restaurante o no está en preparación'
                });
            }

            return res.status(200).json({
                mensaje: 'Pedido despachado correctamente',
                pedido
            });
        } catch (error) {
            console.error('Error al despachar el pedido:', error.message);

            return res.status(500).json({
                error: 'Error interno al despachar el pedido'
            });
        }
    }
);

// CONFIRMAR RECEPCIÓN DEL PEDIDO
app.patch('/api/ordenes/:id/recibido',verificarToken,verificarRol('cliente'),async (req, res) => {
        try {
            const idPedido = Number(req.params.id);

            if (!Number.isInteger(idPedido) || idPedido <= 0) {
                return res.status(400).json({
                    error: 'El ID del pedido debe ser un entero positivo'
                });
            }

            const pedido = await pedidoModel.confirmarEntrega(
                idPedido,
                req.usuario.id
            );

            if (!pedido) {
                return res.status(404).json({
                    error: 'El pedido no existe, no te pertenece o no está despachado'
                });
            }

            return res.status(200).json({
                mensaje: 'Recepción del pedido confirmada correctamente',
                pedido
            });
        } catch (error) {
            console.error(
                'Error al confirmar la entrega:',
                error.message
            );

            return res.status(500).json({
                error: 'Error interno al confirmar la entrega'
            });
        }
    }
);

app.patch('/api/ordenes/:id/no-entregado', verificarToken, verificarRol('cliente'), async (req, res) => {
    try {
        const idPedido = Number(req.params.id);

        if (!Number.isInteger(idPedido) || idPedido <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del pedido no es válido'
            });
        }

        const pedido = await pedidoModel.marcarNoEntregado(
            idPedido,
            req.usuario.id
        );

        if (!pedido) {
            return res.status(404).json({
                mensaje: 'Pedido no encontrado, no pertenece a este cliente o no está en estado despachado'
            });
        }

        return res.status(200).json({
            mensaje: 'Pedido marcado como no entregado',
            pedido
        });

    } catch (error) {
        console.error('Error al marcar el pedido como no entregado:', error);

        return res.status(500).json({
            mensaje: 'Error interno al marcar el pedido como no entregado'
        });
    }
});

 // CALIFICAR PEDIDO
app.patch('/api/ordenes/:id/calificar',verificarToken,verificarRol('cliente'),async (req, res) => {
        try {
            const idPedido = Number(req.params.id);
            const { calificacion } = req.body;

            if (!Number.isInteger(idPedido) || idPedido <= 0) {
                return res.status(400).json({
                    error: 'El ID del pedido debe ser un entero positivo'
                });
            }

            if (
                !Number.isInteger(calificacion) ||
                calificacion < 1 ||
                calificacion > 5
            ) {
                return res.status(400).json({
                    error: 'La calificación debe ser un número entero del 1 al 5'
                });
            }

            const pedido = await pedidoModel.calificarPedido(
                idPedido,
                req.usuario.id,
                calificacion
            );

            if (!pedido) {
                return res.status(404).json({
                    error: 'El pedido no existe, no te pertenece, no está entregado o ya fue calificado'
                });
            }

            return res.status(200).json({
                mensaje: 'Pedido calificado correctamente',
                pedido
            });
        } catch (error) {
            console.error('Error al calificar el pedido:', error.message);

            return res.status(500).json({
                error: 'Error interno al calificar el pedido'
            });
        }
    }
);

// RECHAZAR PEDIDO
app.patch('/api/ordenes/:id/rechazar',verificarToken,verificarRol('restaurante'),async (req, res) => {
        try {
            const idPedido = Number(req.params.id);

            if (!Number.isInteger(idPedido) || idPedido <= 0) {
                return res.status(400).json({
                    mensaje: 'El ID del pedido no es válido'
                });
            }

            const pedido = await pedidoModel.rechazarPedido(
                idPedido,
                req.usuario.id
            );

            if (!pedido) {
                return res.status(404).json({
                    mensaje: 'Pedido no encontrado, no pendiente o no pertenece a este restaurante'
                });
            }

            return res.status(200).json({
                mensaje: 'Pedido rechazado correctamente',
                pedido
            });
        } catch (error) {
            console.error('Error al rechazar el pedido:', error);

            return res.status(500).json({
                mensaje: 'Error interno al rechazar el pedido'
            });
        }
    }
);

// CANCELAR UN PEDIDO
app.patch('/api/ordenes/:id/cancelar',verificarToken,verificarRol('cliente'),async (req, res) => {
        try {
            const idPedido = Number(req.params.id);

            if (!Number.isInteger(idPedido) || idPedido <= 0) {
                return res.status(400).json({
                    mensaje: 'El ID del pedido no es válido'
                });
            }

            const pedido = await pedidoModel.cancelarPedido(
                idPedido,
                req.usuario.id
            );

            if (!pedido) {
                return res.status(404).json({
                    mensaje: 'Pedido no encontrado, no pertenece a este cliente o no se puede cancelar'
                });
            }

            return res.status(200).json({
                mensaje: 'Pedido cancelado correctamente',
                pedido
            });
        } catch (error) {
            console.error('Error al cancelar el pedido:', error);

            return res.status(500).json({
                mensaje: 'Error interno al cancelar el pedido'
            });
        }
    }
);

// REVISAR PEDIDOS DEMORADOS MINUTO A MINUTO
cron.schedule('* * * * *', async () => {
    try {
        const pedidosCancelados =
            await pedidoModel.cancelarPedidosDemorados();

        if (pedidosCancelados.length > 0) {
            console.log(
                'Pedidos cancelados automáticamente:',
                pedidosCancelados.map(pedido => pedido.id)
            );
        }
    } catch (error) {
        console.error(
            'Error al cancelar pedidos demorados:',
            error
        );
    }
});

//========CARRITO============
// Listar los carritos del cliente autenticado
app.get('/api/carritos', verificarToken, verificarRol('cliente'), async (req, res) => {
    try {
        const idCliente = await carritoModel.obtenerIdClientePorUsuario(
            req.usuario.id
        );

        if (!idCliente) {
            return res.status(404).json({
                mensaje: 'No se encontró el perfil del cliente.'
            });
        }

        const carritos = await carritoModel.listarPorCliente(idCliente);

        return res.status(200).json({ carritos });

    } catch (error) {
        console.error('Error al listar los carritos:', error);

        return res.status(500).json({
            mensaje: 'Error al listar los carritos.'
        });
    }
});

// Obtener un carrito específico con sus productos
app.get('/api/carritos/:idCarrito', verificarToken, verificarRol('cliente'), async (req, res) => {
    try {
        const idCarrito = Number(req.params.idCarrito);

        if (!Number.isInteger(idCarrito) || idCarrito <= 0) {
            return res.status(400).json({
                mensaje: 'El ID del carrito debe ser un entero positivo.'
            });
        }

        const idCliente = await carritoModel.obtenerIdClientePorUsuario(req.usuario.id);

        if (!idCliente) {
            return res.status(404).json({
                mensaje: 'No se encontró el perfil del cliente.'
            });
        }

        const carrito = await carritoModel.obtenerPorId(idCarrito);

        if (!carrito || carrito.id_cliente !== idCliente) {
            return res.status(404).json({
                mensaje: 'No se encontró el carrito.'
            });
        }

        const productos = await detalleCarritoModel.obtenerPorCarrito(
            carrito.id
        );

        return res.status(200).json({
            carrito,
            productos
        });

    } catch (error) {
        console.error('Error al consultar el carrito:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar el carrito.'
        });
    }
});

// Agregar un producto al carrito y si no hay un carrito crear uno nuevo
app.post('/api/carritos/:idRestaurante/productos',verificarToken,verificarRol('cliente'),async (req, res) => {
        try {
            const idRestaurante = Number(req.params.idRestaurante);
            const { productoId, cantidad } = req.body;

            // Validar restaurante
            if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
                return res.status(400).json({
                    mensaje: 'El ID del restaurante debe ser un entero positivo.'
                });
            }

            // Validar producto y cantidad
            const idProducto = Number(productoId);
            const cantidadProducto = Number(cantidad);

            if (!Number.isInteger(idProducto) || idProducto <= 0) {
                return res.status(400).json({
                    mensaje: 'El ID del producto debe ser un entero positivo.'
                });
            }

            if (!Number.isInteger(cantidadProducto) || cantidadProducto <= 0) {
                return res.status(400).json({
                    mensaje: 'La cantidad debe ser un entero positivo.'
                });
            }

            // Obtener el cliente autenticado
            const idCliente = await carritoModel.obtenerIdClientePorUsuario(req.usuario.id);

            if (!idCliente) {
                return res.status(404).json({
                    mensaje: 'No se encontró el perfil del cliente.'
                });
            }

            // Verificar que el restaurante exista
            const restaurante = await restauranteModel.obtenerPorId(idRestaurante);

            if (!restaurante) {
                return res.status(404).json({
                    mensaje: 'No se encontró el restaurante.'
                });
            }

            // Buscar el producto
            const producto = await productoModel.obtenerPorId(idProducto);

            if (!producto) {
                return res.status(404).json({
                    mensaje: 'No se encontró el producto.'
                });
            }

            // Verificar que pertenezca al restaurante indicado
            if (Number(producto.id_restaurante) !== idRestaurante) {
                return res.status(400).json({
                    mensaje: 'El producto no pertenece a este restaurante.'
                });
            }

            // Verificar que esté disponible
            if (!producto.disponible) {
                return res.status(400).json({
                    mensaje: 'El producto no está disponible.'
                });
            }

            // Buscar el carrito pendiente del cliente para ese restaurante
            let carrito = await carritoModel.obtenerPendientePorClienteYRestaurante(idCliente,idRestaurante);

            // Si no existe, crear uno
            if (!carrito) {
                carrito = await carritoModel.crear(
                    idCliente,
                    idRestaurante
                );
            }

            // Agregar el producto o aumentar su cantidad
            await detalleCarritoModel.agregarProducto(
                carrito.id,
                idProducto,
                cantidadProducto
            );

            // Actualizar la fecha de modificación del carrito
            carrito = await carritoModel.actualizarFechaActualizacion(
                carrito.id
            );

            // Obtener los productos actualizados
            const productos = await detalleCarritoModel.obtenerPorCarrito(
                carrito.id
            );

            return res.status(200).json({
                mensaje: 'Producto agregado al carrito correctamente.',
                carrito,
                productos
            });

        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);

            return res.status(500).json({
                mensaje: 'Error al agregar el producto al carrito.'
            });
        }
    }
);

// Modificar la cantidad de un producto del carrito
app.patch('/api/carritos/:idCarrito/productos/:idProducto',verificarToken,verificarRol('cliente'),
    async (req, res) => {
        try {
            const idCarrito = Number(req.params.idCarrito);
            const idProducto = Number(req.params.idProducto);
            const { cantidad } = req.body;

            // Validar IDs
            if (!Number.isInteger(idCarrito) || idCarrito <= 0 || !Number.isInteger(idProducto) || idProducto <= 0) {
                return res.status(400).json({
                    mensaje: 'Los IDs deben ser enteros positivos.'
                });
            }

            // Validar cantidad
            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                return res.status(400).json({
                    mensaje: 'La cantidad debe ser un entero positivo.'
                });
            }

            // Obtener el cliente autenticado
            const idCliente = await carritoModel.obtenerIdClientePorUsuario(req.usuario.id);

            if (!idCliente) {
                return res.status(404).json({
                    mensaje: 'No se encontró el perfil del cliente.'
                });
            }

            // Verificar que el carrito exista y pertenezca al cliente
            const carrito = await carritoModel.obtenerPorId(idCarrito);

            if (!carrito || Number(carrito.id_cliente) !== Number(idCliente)) {
                return res.status(404).json({
                    mensaje: 'No se encontró el carrito.'
                });
            }

            // Solo se pueden modificar carritos pendientes
            if (carrito.estado !== 'pendiente') {
                return res.status(400).json({
                    mensaje: 'Solo se pueden modificar carritos pendientes.'
                });
            }

            // Actualizar la cantidad del producto
            const detalle = await detalleCarritoModel.actualizarCantidad(
                idCarrito,
                idProducto,
                cantidad
            );

            if (!detalle) {
                return res.status(404).json({
                    mensaje: 'El producto no se encuentra en este carrito.'
                });
            }

            // Actualizar la fecha de modificación del carrito
            const carritoActualizado =
                await carritoModel.actualizarFechaActualizacion(idCarrito);

            // Obtener los productos actualizados
            const productos = await detalleCarritoModel.obtenerPorCarrito(idCarrito);

            return res.status(200).json({
                mensaje: 'Cantidad actualizada correctamente.',
                carrito: carritoActualizado,
                productos
            });

        } catch (error) {
            console.error('Error al modificar la cantidad:', error);

            return res.status(500).json({
                mensaje: 'Error al modificar la cantidad del producto.'
            });
        }
    }
);

// Eliminar un producto del carrito
app.delete('/api/carritos/:idCarrito/productos/:idProducto',verificarToken,verificarRol('cliente'),
    async (req, res) => {
        try {
            const idCarrito = Number(req.params.idCarrito);
            const idProducto = Number(req.params.idProducto);

            // Validar IDs
            if (
                !Number.isInteger(idCarrito) || idCarrito <= 0 ||
                !Number.isInteger(idProducto) || idProducto <= 0
            ) {
                return res.status(400).json({
                    mensaje: 'Los IDs deben ser enteros positivos.'
                });
            }

            // Obtener el cliente autenticado
            const idCliente = await carritoModel.obtenerIdClientePorUsuario(req.usuario.id);

            if (!idCliente) {
                return res.status(404).json({
                    mensaje: 'No se encontró el perfil del cliente.'
                });
            }

            // Verificar que el carrito exista y pertenezca al cliente
            const carrito = await carritoModel.obtenerPorId(idCarrito);

            if (!carrito || Number(carrito.id_cliente) !== Number(idCliente)) {
                return res.status(404).json({
                    mensaje: 'No se encontró el carrito.'
                });
            }

            // Solo se pueden modificar carritos pendientes
            if (carrito.estado !== 'pendiente') {
                return res.status(400).json({
                    mensaje: 'Solo se pueden modificar carritos pendientes.'
                });
            }

            // Eliminar el producto del carrito
            const detalle = await detalleCarritoModel.eliminarProducto(
                idCarrito,
                idProducto
            );

            if (!detalle) {
                return res.status(404).json({
                    mensaje: 'El producto no se encuentra en este carrito.'
                });
            }

           // Obtener los productos restantes
            const productos = await detalleCarritoModel.obtenerPorCarrito(idCarrito);

            let carritoActualizado;

            // Si no quedan productos, marcar el carrito como abandonado
            if (productos.length === 0) {
                carritoActualizado = await carritoModel.actualizarEstado(
                    idCarrito,
                    'abandonado'
                );
            } else {
                // Si todavía quedan productos, actualizar la fecha de modificación
                carritoActualizado = await carritoModel.actualizarFechaActualizacion(
                    idCarrito
                );
            }

            return res.status(200).json({
                mensaje: 'Producto eliminado del carrito correctamente.',
                carrito: carritoActualizado,
                productos
            });

        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar el producto del carrito.'
            });
        }
    }
);

// Abandonar un carrito completo
app.delete('/api/carritos/:idCarrito',verificarToken,verificarRol('cliente'),async (req, res) => {
        try {
            const idCarrito = Number(req.params.idCarrito);

            // Validar ID
            if (!Number.isInteger(idCarrito) || idCarrito <= 0) {
                return res.status(400).json({
                    mensaje: 'El ID del carrito debe ser un entero positivo.'
                });
            }

            // Obtener el cliente autenticado
            const idCliente = await carritoModel.obtenerIdClientePorUsuario(req.usuario.id);

            if (!idCliente) {
                return res.status(404).json({
                    mensaje: 'No se encontró el perfil del cliente.'
                });
            }

            // Verificar que el carrito exista y pertenezca al cliente
            const carrito = await carritoModel.obtenerPorId(idCarrito);

            if (!carrito || Number(carrito.id_cliente) !== Number(idCliente)) {
                return res.status(404).json({
                    mensaje: 'No se encontró el carrito.'
                });
            }

            // Solo se pueden abandonar carritos pendientes
            if (carrito.estado !== 'pendiente') {
                return res.status(400).json({
                    mensaje: 'Solo se pueden abandonar carritos pendientes.'
                });
            }

            // Eliminar todos los productos del carrito
            await detalleCarritoModel.eliminarTodosPorCarrito(idCarrito);

            // Cambiar el estado a abandonado
            const carritoActualizado = await carritoModel.actualizarEstado(
                idCarrito,
                'abandonado'
            );

            return res.status(200).json({
                mensaje: 'Carrito abandonado correctamente.',
                carrito: carritoActualizado
            });

        } catch (error) {
            console.error('Error al abandonar el carrito:', error);

            return res.status(500).json({
                mensaje: 'Error al abandonar el carrito.'
            });
        }
    }
);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de EcoBite escuchando en http://localhost:${PORT}`);
});
