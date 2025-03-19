import PedidosService from "../services/PedidosService.js";

const agregarAlCarro = async (req, res) => {
    try {
        console.log('El body es:', req.body);
        const { productoId, cantidad } = req.body;
        const usuarioId = req.usuario.id; // Obtener el usuario autenticado
        console.log('Se ha llamado a la función agregarAlCarro');
        console.log('usuarioId:', usuarioId);
        console.log('productoId:', productoId);
        if (!productoId || cantidad <= 0) {
            console.log("Datos inválidos");
            return res.status(400).json({ success: false, message: "Datos inválidos" });
        }
        console.log("productoId:", productoId);
        const resultado = await PedidosService.agregarProducto(usuarioId, productoId, cantidad);
        console.log("resultado: Funcionó bien");
        return res.json(resultado);
    } catch (error) {
        console.error("Error en agregarAlCarro:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};


export {
    agregarAlCarro
}