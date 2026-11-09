'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('productos', 'precio', {
      type: Sequelize.INTEGER, // Cambia de DECIMAL a INTEGER
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('productos', 'precio', {
      type: Sequelize.DECIMAL(10, 2), // Vuelve a DECIMAL en caso de rollback
      allowNull: false,
    });
  }
};
