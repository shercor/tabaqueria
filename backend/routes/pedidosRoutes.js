import express from "express"
import { agregarAlCarro, obtenerCarrito , verCarrito} from '../controllers/pedidosController.js'
import verificarJWT from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadFilesMiddleware.js"

const router = express.Router()

router.post('/agregar-al-carro', agregarAlCarro)
router.get('/obtener-carrito', obtenerCarrito)
router.get('/finalizar-pedido', verCarrito)

export default router