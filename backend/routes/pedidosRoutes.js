import express from "express"
import { agregarAlCarro, eliminarDelCarro, obtenerCarrito , verCarrito, quitarDelCarro, finalizar} from '../controllers/pedidosController.js'
import verificarJWT from "../middlewares/authMiddleware.js"
import upload from "../middlewares/uploadFilesMiddleware.js"
import putPedidosValidator from "../middlewares/validators/Pedidos/putPedidosValidator.js"
import patchPedidosValidator from "../middlewares/validators/Pedidos/patchPedidosValidator.js"
import validateErrors from "../middlewares/validators/validateErrors.js"


const router = express.Router()

router.post('/agregar-al-carro', agregarAlCarro)
router.post('/quitar-del-carro', quitarDelCarro)
router.post('/eliminar-del-carro', eliminarDelCarro)
router.get('/obtener-carrito', obtenerCarrito)
router.get('/finalizar-pedido', verCarrito)
router.patch('/finalizar/:id', patchPedidosValidator, validateErrors, finalizar);


export default router