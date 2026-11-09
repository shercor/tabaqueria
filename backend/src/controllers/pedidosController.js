import * as carritoService from '../services/carritoService.js';
import * as pedidosService from '../services/pedidosService.js';

// Respuesta JSON común de las operaciones del carrito (la usa public/js/api.js)
const responderCarrito = (res, message, pedido) => res.json({ success: true, message, pedido });

const agregarAlCarro = async (req, res) => {
    const { productoId, cantidad = 1 } = req.body;
    const pedido = await carritoService.agregarProducto(req.usuario.id, productoId, cantidad);
    responderCarrito(res, 'Producto agregado al carrito', pedido);
};

const quitarDelCarro = async (req, res) => {
    const pedido = await carritoService.restarProducto(req.usuario.id, req.body.detalleId);
    responderCarrito(res, 'Producto restado del carrito', pedido);
};

const eliminarDelCarro = async (req, res) => {
    const pedido = await carritoService.eliminarProducto(req.usuario.id, req.body.detalleId);
    responderCarrito(res, 'Producto eliminado del carrito', pedido);
};

const obtenerCarrito = async (req, res) => {
    res.json({ success: true, pedido: await carritoService.obtener(req.usuario.id) });
};

// Vista del carrito para revisar y finalizar el pedido
const verCarrito = async (req, res) => {
    const pedido = await carritoService.obtener(req.usuario.id);
    res.render('pedidos/carrito', {
        pagina: 'Tu carrito de compras',
        barra: true,
        pedido,
        detalles: pedido?.detalles_pedido ?? [],
    });
};

const finalizar = async (req, res) => {
    const pedido = await pedidosService.finalizar(req.usuario.id, req.params.id, req.body.delivery);
    // Pendiente: email de confirmación y pago
    res.json({ success: true, message: 'Pedido finalizado correctamente', pedido });
};

export { agregarAlCarro, quitarDelCarro, eliminarDelCarro, obtenerCarrito, verCarrito, finalizar };
