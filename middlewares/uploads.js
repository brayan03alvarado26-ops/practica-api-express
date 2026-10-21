const multer = require('multer');

// Configurar el destino y el nombre del archivo
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //Apunta a la carpeta uploads 
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Renombra el archivoagregando un tiempstamp para evitar sobrescrituras
        cb(null, Date.now() + '-' + file.originalname);
    }
});
// Crear la instancia del middleware
const upload = multer({ storage: storage });

module.exports = upload;