import express from "express"
import { agregarAlCarro, eliminarDelCarro, obtenerCarrito , verCarrito, quitarDelCarro} from '../controllers/pedidosController.js'
import verificarJWT from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadFilesMiddleware.js"

const router = express.Router()

router.post('/agregar-al-carro', agregarAlCarro)
router.post('/quitar-del-carro', quitarDelCarro)
router.post('/eliminar-del-carro', eliminarDelCarro)
router.get('/obtener-carrito', obtenerCarrito)
router.get('/finalizar-pedido', verCarrito)

export default router