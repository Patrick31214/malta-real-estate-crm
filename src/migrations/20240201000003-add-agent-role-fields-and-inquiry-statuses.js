'use strict';

/**
 * Migration: Add manager_name and sub_role columns to agents table,
 * and update the inquiries.status ENUM to include new pipeline values.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    // --- agents table: add manager_name and sub_role columns ---
    const agentsTableDesc = await queryInterface.describeTable('agents').catch(() => null);

    if (agentsTableDesc && !agentsTableDesc.manager_name) {
      await queryInterface.addColumn('agents', 'manager_name', {
        type: Sequelize.STRING(200),
        allowNull: true
      });
    }

    if (agentsTableDesc && !agentsTableDesc.sub_role) {
      await queryInterface.addColumn('agents', 'sub_role', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    // --- inquiries table: allow property_id to be nullable ---
    const inqTableDesc = await queryInterface.describeTable('inquiries').catch(() => null);
    if (inqTableDesc && inqTableDesc.property_id) {
      if (dialect === 'postgres') {
        await queryInterface.sequelize.query(
          `ALTER TABLE inquiries ALTER COLUMN property_id DROP NOT NULL;`
        );
      }
      // SQLite: handled by model sync
    }

    // --- inquiries: extend status ENUM with new values ---
    if (dialect === 'postgres') {
      const newValues = ['assigned', 'matched', 'resolved', 'on_hold'];
      for (const val of newValues) {
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_inquiries_status" ADD VALUE IF NOT EXISTS '${val}';`
        );
      }
    }
    // SQLite: no-op — VARCHAR column accepts any string
  },

  async down(queryInterface, Sequelize) {
    const agentsTableDesc = await queryInterface.describeTable('agents').catch(() => null);
    if (agentsTableDesc) {
      if (agentsTableDesc.manager_name) {
        await queryInterface.removeColumn('agents', 'manager_name');
      }
      if (agentsTableDesc.sub_role) {
        await queryInterface.removeColumn('agents', 'sub_role');
      }
    }
    // ENUM value removal in Postgres is complex; skipping for safety
  }
};
