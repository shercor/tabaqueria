import PedidosService from "../services/PedidosService.js";

const agregarAlCarro = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;
        const usuarioId = req.usuario.id;
        if (!productoId || cantidad <= 0) {
            console.log("Datos inválidos");
            return res.status(400).json({ success: false, message: "Datos inválidos" });
        }
        const resultado = await PedidosService.agregarProducto(usuarioId, productoId, cantidad);
        // Validar caso en que resultado de un error
        console.log("Producto añadido al carro");
        return res.json(resultado);
    } catch (error) {
        console.error("Error en agregarAlCarro:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

const obtenerCarrito = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const resultado = await PedidosService.obtenerCarrito(usuarioId);
        return res.json(resultado);
    } catch (error) {
        console.error("Error en obtenerCarrito:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
}

const verCarrito = async (req, res) => {
    // Función que mostrará el carrito de compras para finalizar el pedido
    try {
        const usuarioId = req.usuario.id;
        const carrito = await PedidosService.obtenerCarrito(usuarioId);
        console.log(carrito.pedido.detalles_pedido);
        console.log('Ese fue el pedido');
        res.render('pedidos/ver-carrito', { 
            carrito,
            barra: true,
            csrf : req.csrfToken(), // Token CSRF para proteger el formulario
            pagina: 'Tu carrito de compras',
        });

    } catch (error) {
        console.error("Error en verCarrito:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
}

const eliminarDelCarro = async (req, res) => {
    // Función que eliminará un producto del carrito de compras
    try {
        console.log('Llegó a eliminar del carro');
        const { productoId, pedidoId } = req.body;

        if (!productoId || !pedidoId) {
            console.log("Datos inválidos");
            return res.status(400).json({ success: false, message: "Datos inválidos" });
        }

        const resultado = await PedidosService.eliminarProducto(pedidoId, productoId);
        console.log("Producto eliminado del carro");
        return res.json(resultado);
    } catch (error) {
        console.error("Error en eliminarDelCarro:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
}


export {
    agregarAlCarro,
    eliminarDelCarro,
    obtenerCarrito,
    verCarrito
}