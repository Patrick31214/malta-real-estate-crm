'use strict';

/**
 * Migration: Add 'manager' and 'employee' to the users.role ENUM (PostgreSQL).
 *
 * For SQLite (dev/test), Sequelize model sync handles the ENUM automatically
 * because SQLite stores ENUMs as VARCHAR. In PostgreSQL, we must ALTER the type.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      // Rename old type, create new one with extra values, migrate column, drop old type
      await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'manager';`,
          { transaction: t }
        );
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'employee';`,
          { transaction: t }
        );
      });
    }
    // SQLite: no-op — model sync adds the new values via VARCHAR column
  },

  async down(queryInterface, Sequelize) {
    // Removing ENUM values in PostgreSQL is complex and rarely needed.
    // A full rollback would require recreating the type and migrating data.
    // For safety, this down migration is intentionally left as a no-op.
  }
};
