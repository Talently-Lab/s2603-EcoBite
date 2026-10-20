
// ==========================================
// SERVIDOR Y RUTAS DE LA API
// Configuración de Express y atención de solicitudes HTTP
// ==========================================
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const restauranteModel = require('./models/restaurante.model');//importa restaurante.model
const usuarioModel = require('./models/usuario.model');//importar usuario.model
const clienteModel = require('./models/cliente.model');//importar cliente.model
const { verificarToken, verificarRol } = require('./middlewares/auth.middleware');

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

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
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

        res.status(201).json({
            mensaje: 'Cuenta de restaurante creada correctamente',
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
//app.get('/api/usuario', async (req, res) => {
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
//app.get('/api/usuario/:id', async (req, res) => {
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
//app.put('/api/usuario/:id', async (req, res) => {
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
//app.delete('/api/usuario/:id',async (req, res) => {
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
        const restaurantes = await restauranteModel.obtenerTodos();
        res.status(200).json(restaurantes);
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
//app.post('/api/restaurantes', async(req,res)=>{
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

        // La cuenta ya tiene un perfil de restaurante
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Esta cuenta ya tiene un perfil de restaurante'
            });
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
//app.put('/api/restaurantes/:id', async (req, res) => {
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
//app.delete('/api/restaurantes/:id', async (req, res) => {
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

//============CLIENTE==============
 // CREAR CLIENTE
//app.post('/api/clientes', async (req, res) => {
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
//app.get('/api/clientes', async (req, res) => {
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
//app.get('/api/clientes/:id', async (req, res) => {
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
//app.put('/api/clientes/:id', async (req, res) => {
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
//app.delete('/api/clientes/:id', async (req, res) => {
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




// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de EcoBite escuchando en http://localhost:${PORT}`);
});
