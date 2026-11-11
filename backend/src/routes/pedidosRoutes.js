import { Router } from 'express';
import * as pedidos from '../controllers/pedidosController.js';
import { validarJSON } from '../middlewares/validacion.js';
import {
    agregarAlCarroValidator,
    detalleCarritoValidator,
    finalizarPedidoValidator,
} from '../validators/pedidosValidators.js';

const router = Router();

// Carrito (JSON, lo usa el modal del carrito)
router.get('/obtener-carrito', pedidos.obtenerCarrito);
router.post('/agregar-al-carro', agregarAlCarroValidator, validarJSON, pedidos.agregarAlCarro);
router.post('/quitar-del-carro', detalleCarritoValidator, validarJSON, pedidos.quitarDelCarro);
router.post('/eliminar-del-carro', detalleCarritoValidator, validarJSON, pedidos.eliminarDelCarro);

// Checkout
router.get('/finalizar-pedido', pedidos.verCarrito);
router.patch('/finalizar/:id', finalizarPedidoValidator, validarJSON, pedidos.finalizar);

export default router;
