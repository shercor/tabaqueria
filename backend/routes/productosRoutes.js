import express from "express"
import { crear , editar , ingresarProducto , editarProducto , listaProductos} from '../controllers/productosController.js'
import { asyncHandler } from "../helpers/http.js"
import { subirImagen } from "../middlewares/uploadFilesMiddleware.js"
import productoValidator from "../middlewares/validators/Productos/productoValidator.js"

const router = express.Router()

router.get('/crear', asyncHandler(crear))
router.post('/crear', subirImagen, productoValidator, asyncHandler(ingresarProducto))
router.get('/editar/:id', asyncHandler(editar))
router.post('/editar/:id', subirImagen, productoValidator, asyncHandler(editarProducto))
router.get('/lista/:id?' , asyncHandler(listaProductos));

export default router
