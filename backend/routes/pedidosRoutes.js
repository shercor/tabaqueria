import express from "express"
import { agregarAlCarro, eliminarDelCarro, obtenerCarrito , verCarrito, quitarDelCarro, finalizar} from '../controllers/pedidosController.js'
import { asyncHandler } from "../helpers/http.js"
import agregarAlCarroValidator from "../middlewares/validators/Pedidos/agregarAlCarroValidator.js"
import detalleCarritoValidator from "../middlewares/validators/Pedidos/detalleCarritoValidator.js"
import finalizarPedidoValidator from "../middlewares/validators/Pedidos/finalizarPedidoValidator.js"
import validateErrors from "../middlewares/validators/validateErrors.js"

const router = express.Router()

router.post('/agregar-al-carro', agregarAlCarroValidator, validateErrors, asyncHandler(agregarAlCarro))
router.post('/quitar-del-carro', detalleCarritoValidator, validateErrors, asyncHandler(quitarDelCarro))
router.post('/eliminar-del-carro', detalleCarritoValidator, validateErrors, asyncHandler(eliminarDelCarro))
router.get('/obtener-carrito', asyncHandler(obtenerCarrito))
router.get('/finalizar-pedido', asyncHandler(verCarrito))
router.patch('/finalizar/:id', finalizarPedidoValidator, validateErrors, asyncHandler(finalizar));

export default router
