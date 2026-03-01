'use strict';

module.exports = {
  async up(queryInterface) {
    // Add missing inquiry type enum values; each statement is wrapped in a DO block
    // to guard against duplicate-value errors without needing IF NOT EXISTS syntax
    // (which is not available in all supported PG versions inside transactions).
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'property' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_inquiries_inquiry_type')) THEN
          ALTER TYPE "enum_inquiries_inquiry_type" ADD VALUE 'property';
        END IF;
      END$$;
    `);
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'affiliate' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_inquiries_inquiry_type')) THEN
          ALTER TYPE "enum_inquiries_inquiry_type" ADD VALUE 'affiliate';
        END IF;
      END$$;
    `);
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partnership' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_inquiries_inquiry_type')) THEN
          ALTER TYPE "enum_inquiries_inquiry_type" ADD VALUE 'partnership';
        END IF;
      END$$;
    `);
  },

  async down() {
    // PostgreSQL does not support removing values from an ENUM — no-op
  }
};
