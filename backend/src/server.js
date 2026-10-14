
// ==========================================
// SERVIDOR Y RUTAS DE LA API
// Configuración de Express y atención de solicitudes HTTP
// ==========================================
const express = require('express');
const restauranteModel = require('./models/restaurante.model');//importa restaurante.model

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
