'use strict';

const { addIndexIfNotExists } = require('../utils/migration-helpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        unique: true
      },
      license_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      specialization: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'e.g., Residential, Commercial, Luxury Properties'
      },
      commission_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
          min: 0,
          max: 100
        },
        comment: 'Commission percentage'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      mobile: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      office_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      profile_image_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      languages: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: ['English']
      },
      years_experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await addIndexIfNotExists(queryInterface, 'agents', ['user_id'], {
      name: 'agents_user_id_idx',
      unique: true
    });
    await addIndexIfNotExists(queryInterface, 'agents', ['license_number'], {
      name: 'agents_license_number_idx',
      unique: true
    });
    await addIndexIfNotExists(queryInterface, 'agents', ['is_active'], {
      name: 'agents_is_active_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('agents');
  }
};
