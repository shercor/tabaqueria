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
        const resultado = await PedidosService.obtenerCarrito(usuarioId);

    } catch (error) {
        console.error("Error en verCarrito:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
}


export {
    agregarAlCarro,
    obtenerCarrito,
    verCarrito
}