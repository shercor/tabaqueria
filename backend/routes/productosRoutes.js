import express from "express"
import { crear , editar , ingresarProducto , editarProducto , listaProductos} from '../controllers/productosController.js'
import verificarJWT from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadFilesMiddleware.js"

const router = express.Router()

router.get('/crear', crear)
router.get('/editar/:id', editar)
router.post('/crear', ingresarProducto)
router.post('/editar/:id', editarProducto)
router.get('/lista/:id?' , listaProductos);

// router.post('/crear', upload.single('imagen'), ingresarProducto);


export default router