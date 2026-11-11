import { Router } from 'express';
import * as productos from '../controllers/productosController.js';
import { subirImagen } from '../middlewares/subirImagen.js';
import { productoValidator } from '../validators/productosValidators.js';

const router = Router();

router.get('/lista{/:id}', productos.lista);
router.get('/crear', productos.formularioCrear);
router.post('/crear', subirImagen, productoValidator, productos.crear);
router.get('/editar/:id', productos.formularioEditar);
router.post('/editar/:id', subirImagen, productoValidator, productos.editar);

export default router;
