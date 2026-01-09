'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get property and user IDs
    const properties = await queryInterface.sequelize.query(
      `SELECT id FROM properties ORDER BY created_at LIMIT 5`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role IN ('admin', 'agent') ORDER BY created_at LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (properties.length < 3 || users.length < 2) {
      console.log('Not enough properties or users found. Please run previous seeders first.');
      return;
    }

    await queryInterface.bulkInsert('property_updates_queue', [
      {
        id: uuidv4(),
        property_id: properties[0].id,
        update_type: 'price_change',
        old_value: JSON.stringify({ price: 370000.00 }),
        new_value: JSON.stringify({ price: 350000.00 }),
        description: 'Price reduction to attract more buyers',
        status: 'completed',
        scheduled_for: new Date('2024-01-20T09:00:00'),
        processed_at: new Date('2024-01-20T09:05:00'),
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        priority: 2,
        metadata: JSON.stringify({ reason: 'market_adjustment', approved_by: 'owner' }),
        created_by: users[0].id,
        created_at: new Date('2024-01-19T15:00:00'),
        updated_at: new Date('2024-01-20T09:05:00')
      },
      {
        id: uuidv4(),
        property_id: properties[1].id,
        update_type: 'images_update',
        old_value: JSON.stringify({ image_count: 2 }),
        new_value: JSON.stringify({ image_count: 8, added_professional_photos: true }),
        description: 'Professional photography added',
        status: 'completed',
        scheduled_for: new Date('2024-01-22T10:00:00'),
        processed_at: new Date('2024-01-22T10:15:00'),
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        priority: 3,
        metadata: JSON.stringify({ photographer: 'Malta Pro Photos', cost: 300 }),
        created_by: users[1].id,
        created_at: new Date('2024-01-21T14:00:00'),
        updated_at: new Date('2024-01-22T10:15:00')
      },
      {
        id: uuidv4(),
        property_id: properties[2].id,
        update_type: 'featured_update',
        old_value: JSON.stringify({ featured: false }),
        new_value: JSON.stringify({ featured: true }),
        description: 'Property promoted to featured listing',
        status: 'completed',
        scheduled_for: new Date('2024-01-25T08:00:00'),
        processed_at: new Date('2024-01-25T08:02:00'),
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        priority: 2,
        metadata: JSON.stringify({ duration_days: 30, payment_status: 'paid' }),
        created_by: users[0].id,
        created_at: new Date('2024-01-24T16:30:00'),
        updated_at: new Date('2024-01-25T08:02:00')
      },
      {
        id: uuidv4(),
        property_id: properties[3].id,
        update_type: 'status_change',
        old_value: JSON.stringify({ status: 'available' }),
        new_value: JSON.stringify({ status: 'under_offer' }),
        description: 'Offer received and accepted',
        status: 'completed',
        scheduled_for: new Date('2024-01-27T11:00:00'),
        processed_at: new Date('2024-01-27T11:03:00'),
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        priority: 1,
        metadata: JSON.stringify({ offer_amount: 650000, buyer_name: 'Richard Brown' }),
        created_by: users[1].id,
        created_at: new Date('2024-01-27T10:45:00'),
        updated_at: new Date('2024-01-27T11:03:00')
      },
      {
        id: uuidv4(),
        property_id: properties[4].id,
        update_type: 'details_update',
        old_value: JSON.stringify({ description: 'Short description' }),
        new_value: JSON.stringify({ description: 'Contemporary villa with private pool and garden...', features_added: ['BBQ_area'] }),
        description: 'Enhanced property description and features',
        status: 'completed',
        scheduled_for: new Date('2024-01-28T14:00:00'),
        processed_at: new Date('2024-01-28T14:05:00'),
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        priority: 4,
        metadata: JSON.stringify({ updated_by_agent: true }),
        created_by: users[1].id,
        created_at: new Date('2024-01-28T13:30:00'),
        updated_at: new Date('2024-01-28T14:05:00')
      },
      {
        id: uuidv4(),
        property_id: properties[0].id,
        update_type: 'price_change',
        old_value: JSON.stringify({ price: 350000.00 }),
        new_value: JSON.stringify({ price: 345000.00 }),
        description: 'Further price reduction scheduled',
        status: 'pending',
        scheduled_for: new Date('2024-02-15T09:00:00'),
        processed_at: null,
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        priority: 3,
        metadata: JSON.stringify({ reason: 'owner_request', conditional: 'if_no_offers' }),
        created_by: users[0].id,
        created_at: new Date('2024-01-30T10:00:00'),
        updated_at: new Date('2024-01-30T10:00:00')
      },
      {
        id: uuidv4(),
        property_id: properties[1].id,
        update_type: 'other',
        old_value: null,
        new_value: JSON.stringify({ virtual_tour_added: true, url: 'https://virtualtour.example.com' }),
        description: 'Virtual tour integration pending',
        status: 'processing',
        scheduled_for: new Date('2024-02-05T10:00:00'),
        processed_at: null,
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        priority: 5,
        metadata: JSON.stringify({ service_provider: 'Matterport' }),
        created_by: users[1].id,
        created_at: new Date('2024-01-31T09:00:00'),
        updated_at: new Date('2024-02-05T10:05:00')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('property_updates_queue', null, {});
  }
};
