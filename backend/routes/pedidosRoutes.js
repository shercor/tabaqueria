import express from "express"
import { agregarAlCarro, obtenerCarrito} from '../controllers/pedidosController.js'
import verificarJWT from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadFilesMiddleware.js"

const router = express.Router()

router.post('/agregar-al-carro', agregarAlCarro)
router.get('/obtener-carrito', obtenerCarrito)

export default router