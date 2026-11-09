'use strict';

// Los montos son pesos chilenos: se usan enteros igual que productos.precio
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('pedidos', 'total', { type: Sequelize.INTEGER, allowNull: false });
        await queryInterface.changeColumn('detalles_pedidos', 'precio', { type: Sequelize.INTEGER, allowNull: false });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('pedidos', 'total', { type: Sequelize.DECIMAL(10, 2), allowNull: false });
        await queryInterface.changeColumn('detalles_pedidos', 'precio', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        });
    },
};
