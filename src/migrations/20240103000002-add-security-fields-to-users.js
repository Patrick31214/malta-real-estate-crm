'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'is_blocked', { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false });
    await queryInterface.addColumn('users', 'blocked_at', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('users', 'blocked_reason', { type: Sequelize.STRING(500), allowNull: true });
    await queryInterface.addColumn('users', 'last_login_at', { type: Sequelize.DATE, allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'last_login_at');
    await queryInterface.removeColumn('users', 'blocked_reason');
    await queryInterface.removeColumn('users', 'blocked_at');
    await queryInterface.removeColumn('users', 'is_blocked');
  }
};
