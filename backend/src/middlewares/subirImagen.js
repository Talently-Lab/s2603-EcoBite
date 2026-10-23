
const multer = require('multer');

const subirImagen = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // Máximo 5 MB
    },
    fileFilter: (req, file, callback) => {
        const tiposPermitidos = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!tiposPermitidos.includes(file.mimetype)) {
            return callback(
                new Error('Solo se permiten imágenes JPG, PNG o WEBP')
            );
        }

        callback(null, true);
    }
});

module.exports = subirImagen;
