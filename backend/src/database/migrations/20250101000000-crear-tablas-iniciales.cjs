'use strict';

// Esquema inicial, igual al que generaba db.sync(). Omite las tablas que ya existen
// para que una base creada antes con sync() quede registrada sin cambios.
module.exports = {
    async up(queryInterface, Sequelize) {
        const existentes = (await queryInterface.showAllTables()).map((tabla) =>
            typeof tabla === 'string' ? tabla : tabla.tableName
        );

        const crear = async (tabla, columnas, indices = []) => {
            if (existentes.includes(tabla)) return;
            await queryInterface.createTable(tabla, columnas);
            for (const [nombre, campos] of indices) {
                await queryInterface.addIndex(tabla, campos, { name: nombre });
            }
        };

        const id = () => ({ type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true });
        const fechas = () => ({
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false },
        });
        const referencia = (tabla, onDelete, allowNull) => ({
            type: Sequelize.INTEGER,
            allowNull,
            references: { model: tabla, key: 'id' },
            onUpdate: 'CASCADE',
            onDelete,
        });

        await crear('usuarios', {
            id: id(),
            nombre: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false },
            password: { type: Sequelize.STRING, allowNull: false },
            token: { type: Sequelize.STRING },
            confirmado: { type: Sequelize.BOOLEAN },
            ...fechas(),
        });

        await crear('categorias', {
            id: id(),
            nombre: { type: Sequelize.STRING, allowNull: false },
            descripcion: { type: Sequelize.STRING, allowNull: false },
            estado: { type: Sequelize.BOOLEAN },
            ...fechas(),
        });

        await crear(
            'productos',
            {
                id: id(),
                nombre: { type: Sequelize.STRING, allowNull: false },
                descripcion: { type: Sequelize.TEXT },
                precio: { type: Sequelize.INTEGER, allowNull: false },
                stock: { type: Sequelize.INTEGER, allowNull: false },
                categoria_id: referencia('categorias', 'SET NULL', true),
                imagen: { type: Sequelize.STRING(255) },
                estado: { type: Sequelize.BOOLEAN },
                ...fechas(),
            },
            [['idx_categoria_id', ['categoria_id']]]
        );

        await crear(
            'pedidos',
            {
                id: id(),
                total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
                estado: {
                    type: Sequelize.ENUM('carrito', 'pagado', 'enviado', 'entregado', 'cancelado', 'eliminado'),
                    allowNull: false,
                    defaultValue: 'carrito',
                },
                usuario_id: referencia('usuarios', 'CASCADE', true),
                imagen: { type: Sequelize.STRING(255) },
                delivery: { type: Sequelize.BOOLEAN },
                fecha_pedido: { type: Sequelize.DATE },
                ...fechas(),
            },
            [['idx_usuario_id', ['usuario_id']]]
        );

        await crear(
            'detalles_pedidos',
            {
                id: id(),
                cantidad: { type: Sequelize.INTEGER, allowNull: false },
                precio: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
                pedido_id: referencia('pedidos', 'CASCADE', false),
                producto_id: referencia('productos', 'CASCADE', false),
                ...fechas(),
            },
            [
                ['idx_pedido_id', ['pedido_id']],
                ['idx_producto_id', ['producto_id']],
            ]
        );

        await crear('metodos_pago', {
            id: id(),
            usuario_id: referencia('usuarios', 'CASCADE', false),
            tipo: { type: Sequelize.STRING(50), allowNull: false },
            detalles: { type: Sequelize.TEXT, allowNull: false },
        });
    },

    async down(queryInterface) {
        for (const tabla of ['metodos_pago', 'detalles_pedidos', 'pedidos', 'productos', 'categorias', 'usuarios']) {
            await queryInterface.dropTable(tabla);
        }
    },
};
