
// ==========================================
// SERVIDOR Y RUTAS DE LA API
// Configuración de Express y atención de solicitudes HTTP
// ==========================================
const express = require('express');
const restauranteModel = require('./models/restaurante.model');//importa restaurante.model
const usuarioModel = require('./models/usuario.model');//importar usuario.model

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

//============USUARIO============
// REGISTRAR USUARIO-CLIENTE
app.post('/api/usuario/registro-cliente', async (req, res) => {
    try {
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

        res.status(500).json({
            error: 'Error interno al registrar el usuario'
        });
    }
});

//REGISTRAR USUARIO-RESTAURANTE
app.post('/api/usuario/registro-restaurante', async (req, res) => {
    try {
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
app.get('/api/usuario', async (req, res) => {
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
app.get('/api/usuario/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
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

//MODIFICAR UN USAURIO
app.put('/api/usuario/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

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
app.delete('/api/usuario/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
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
        const id = req.params.id;
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
app.post('/api/restaurantes', async(req,res)=>{
    try{
        const restaurante = req.body;
        if(
            !restaurante.id_usuario ||
            !restaurante.nombre ||
            !restaurante.cuit ||
            !restaurante.categoria
        ){
            return res.status(400).json({
                error:'Faltan datos obligatorios para el restaurante'
            });
        }
        const nuevoRestaurante= await restauranteModel.crear(restaurante);
        res.status(201).json({
            mensaje: 'Restaurante creado con exito',
            restaurante: nuevoRestaurante
        });
    }catch(error){
        console.error('Error al crear el restaurante:',error.message);
        res.status(500).json({
            error:'Error interno al crear el restaurante'
        });
    }
});

//PUT para modificar un restaurante
app.put('/api/restaurantes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const restaurante = req.body;

        if (
            !restaurante.nombre ||
            !restaurante.cuit ||
            !restaurante.categoria
        ) {
            return res.status(400).json({
                error: 'Faltan datos obligatorios para actualizar el restaurante'
            });
        }

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
app.delete('/api/restaurantes/:id', async (req, res) => {
    try {
        const id = req.params.id;

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




// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de EcoBite escuchando en http://localhost:${PORT}`);
});
