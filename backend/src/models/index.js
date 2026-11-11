// Punto único de acceso a los modelos: aquí se definen todas las relaciones
import db from '../config/database.js';
import Usuario from './Usuario.js';
import Categoria from './Categoria.js';
import Producto from './Producto.js';
import Pedido, { ESTADOS_PEDIDO } from './Pedido.js';
import DetallePedido from './DetallePedido.js';
import MetodoPago from './MetodoPago.js';

Categoria.hasMany(Producto, { foreignKey: 'categoria_id' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', onDelete: 'SET NULL' });

Usuario.hasMany(Pedido, { foreignKey: 'usuario_id' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });

Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id', as: 'detalles_pedido' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id' });
DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id' });

Usuario.hasMany(MetodoPago, { foreignKey: 'usuario_id' });
MetodoPago.belongsTo(Usuario, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });

export { db, Usuario, Categoria, Producto, Pedido, DetallePedido, MetodoPago, ESTADOS_PEDIDO };
