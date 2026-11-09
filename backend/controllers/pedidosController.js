import PedidosService from "../services/PedidosService.js";

// Los errores (de negocio o inesperados) los responde errorMiddleware

const agregarAlCarro = async (req, res) => {
    const { productoId, cantidad = 1 } = req.body;
    const resultado = await PedidosService.agregarProducto(req.usuario.id, productoId, cantidad);
    return res.json(resultado);
};

const quitarDelCarro = async (req, res) => {
    const resultado = await PedidosService.restarProducto(req.usuario.id, req.body.detalleId);
    return res.json(resultado);
};

const eliminarDelCarro = async (req, res) => {
    const resultado = await PedidosService.eliminarProducto(req.usuario.id, req.body.detalleId);
    return res.json(resultado);
};

const obtenerCarrito = async (req, res) => {
    const resultado = await PedidosService.obtenerCarrito(req.usuario.id);
    return res.json(resultado);
};

// Vista del carrito para revisar y finalizar el pedido
const verCarrito = async (req, res) => {
    const { pedido } = await PedidosService.obtenerCarrito(req.usuario.id);

    res.render('pedidos/ver-carrito', {
        pagina: 'Tu carrito de compras',
        barra: true,
        pedido,
        detalles: pedido?.detalles_pedido ?? []
    });
};

const finalizar = async (req, res) => {
    const pedido = await PedidosService.finalizarPedido(req.usuario.id, req.params.id, req.body.delivery);

    // Pendiente: email de confirmación y pago

    return res.json({
        success: true,
        pedido,
        message: 'Pedido finalizado correctamente'
    });
};

export {
    agregarAlCarro,
    eliminarDelCarro,
    obtenerCarrito,
    verCarrito,
    quitarDelCarro,
    finalizar
}
