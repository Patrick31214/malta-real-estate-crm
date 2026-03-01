'use strict';

module.exports = {
  async up(queryInterface) {
    // Add 'bungalow' and 'warehouse' to the property_type enum if not already present
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'bungalow' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_properties_property_type')) THEN
          ALTER TYPE "enum_properties_property_type" ADD VALUE 'bungalow';
        END IF;
      END$$;
    `);
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'warehouse' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_properties_property_type')) THEN
          ALTER TYPE "enum_properties_property_type" ADD VALUE 'warehouse';
        END IF;
      END$$;
    `);
  },

  async down() {
    // PostgreSQL does not support removing values from an ENUM — no-op
  }
};
