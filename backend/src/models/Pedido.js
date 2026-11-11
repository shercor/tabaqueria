import { DataTypes } from 'sequelize';
import db from '../config/database.js';

// 'carrito' es el pedido abierto del usuario; al finalizar pasa a 'pagado'
const ESTADOS_PEDIDO = ['carrito', 'pagado', 'enviado', 'entregado', 'cancelado', 'eliminado'];

const Pedido = db.define(
    'pedidos',
    {
        // Pesos chilenos, sin decimales; se recalcula desde los detalles
        total: { type: DataTypes.INTEGER, allowNull: false },
        estado: {
            type: DataTypes.ENUM(...ESTADOS_PEDIDO),
            allowNull: false,
            defaultValue: 'carrito',
        },
        usuario_id: DataTypes.INTEGER,
        imagen: DataTypes.STRING(255),
        delivery: DataTypes.BOOLEAN,
        fecha_pedido: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
        indexes: [{ name: 'idx_usuario_id', fields: ['usuario_id'] }],
    },
);

export { ESTADOS_PEDIDO };
export default Pedido;
