import crypto from 'crypto';
import multer from 'multer';

// La extensión se toma del tipo aceptado y no del nombre original, para que no se pueda subir un .html
const EXTENSIONES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
};
const TAMANO_MAXIMO_MB = 5;

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
        const nombre = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        cb(null, nombre + EXTENSIONES[file.mimetype]);
    }
});

const fileFilter = (req, file, cb) => {
    if (EXTENSIONES[file.mimetype]) return cb(null, true);
    cb(new Error('La imagen debe ser JPG, PNG, WEBP o GIF'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: TAMANO_MAXIMO_MB * 1024 * 1024 }
});

// Procesa el campo "imagen" y deja el error en req.errorImagen para mostrarlo en el formulario
const subirImagen = (req, res, next) => {
    upload.single('imagen')(req, res, error => {
        if (error) {
            req.errorImagen = error.code === 'LIMIT_FILE_SIZE'
                ? `La imagen no puede pesar más de ${TAMANO_MAXIMO_MB} MB`
                : error.message;
        }
        next();
    });
};

export { subirImagen };
export default upload;
