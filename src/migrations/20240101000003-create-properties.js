'use strict';

const { addIndexIfNotExists } = require('../utils/migration-helpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('properties', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'owners',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      agent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'agents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      property_type: {
        type: Sequelize.ENUM(
          'apartment',
          'house',
          'villa',
          'townhouse',
          'penthouse',
          'maisonette',
          'farmhouse',
          'commercial',
          'office',
          'land',
          'garage',
          'other'
        ),
        allowNull: false
      },
      listing_type: {
        type: Sequelize.ENUM('sale', 'rent', 'lease'),
        allowNull: false,
        defaultValue: 'sale'
      },
      status: {
        type: Sequelize.ENUM(
          'available',
          'under_offer',
          'sold',
          'rented',
          'withdrawn',
          'draft'
        ),
        allowNull: false,
        defaultValue: 'draft'
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'EUR'
      },
      bedrooms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      bathrooms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      square_meters: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      year_built: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1800,
          max: 2100
        }
      },
      floor_number: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      total_floors: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Region in Malta (e.g., Northern, Southern, Central)'
      },
      postal_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Malta'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      features: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
        comment: 'e.g., ["pool", "garden", "parking", "balcony", "AC"]'
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
        comment: 'Array of image URLs'
      },
      video_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      virtual_tour_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      energy_rating: {
        type: Sequelize.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'exempt'),
        allowNull: true
      },
      furnished: {
        type: Sequelize.ENUM('furnished', 'semi-furnished', 'unfurnished'),
        allowNull: true
      },
      parking_spaces: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      has_garden: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_pool: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_terrace: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_balcony: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pet_friendly: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
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
    await addIndexIfNotExists(queryInterface, 'properties', ['owner_id'], {
      name: 'properties_owner_id_idx'
    });
    await addIndexIfNotExists(queryInterface, 'properties', ['agent_id'], {
      name: 'properties_agent_id_idx'
    });
    await addIndexIfNotExists(queryInterface, 'properties', ['property_type'], {
      name: 'properties_property_type_idx'
    });
    await addIndexIfNotExists(queryInterface, 'properties', ['listing_type'], {
      name: 'properties_listing_type_idx'
    });
    await addIndexIfNotExists(queryInterface, 'properties', ['status'], {
      name: 'properties_status_idx'
    });
    await addIndexIfNotExists(queryInterface, 'properties', ['city'], {
      name: 'properties_city_idx'
    });
    await addIndexIfNotExists(queryInterface, 'properties', ['price'], {
      name: 'properties_price_idx'
    });
    await addIndexIfNotExists(queryInterface, 'properties', ['is_active'], {
      name: 'properties_is_active_idx'
    });
    await addIndexIfNotExists(queryInterface, 'properties', ['featured'], {
      name: 'properties_featured_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('properties');
  }
};
