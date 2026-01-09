'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get property and agent IDs
    const properties = await queryInterface.sequelize.query(
      `SELECT id FROM properties WHERE status = 'available' ORDER BY created_at LIMIT 5`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const agents = await queryInterface.sequelize.query(
      `SELECT id FROM agents ORDER BY created_at LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (properties.length < 3 || agents.length < 3) {
      console.log('Not enough properties or agents found. Please run previous seeders first.');
      return;
    }

    await queryInterface.bulkInsert('inquiries', [
      {
        id: uuidv4(),
        property_id: properties[0].id,
        agent_id: agents[0].id,
        client_name: 'Thomas Anderson',
        client_email: 'thomas.anderson@example.com',
        client_phone: '+356 9999 6666',
        message: 'I am very interested in this property and would like to schedule a viewing. I am available this weekend.',
        inquiry_type: 'viewing_request',
        status: 'viewing_scheduled',
        priority: 'high',
        preferred_viewing_date: new Date('2024-02-10T10:00:00'),
        preferred_viewing_time: 'morning',
        offer_amount: null,
        source: 'website',
        notes: 'Client is pre-approved for mortgage',
        response_sent: true,
        response_sent_at: new Date('2024-01-25T09:30:00'),
        followed_up: true,
        followed_up_at: new Date('2024-01-26T14:00:00'),
        created_at: new Date('2024-01-25T09:15:00'),
        updated_at: new Date('2024-01-26T14:00:00')
      },
      {
        id: uuidv4(),
        property_id: properties[1].id,
        agent_id: agents[0].id,
        client_name: 'Emily Watson',
        client_email: 'emily.watson@example.com',
        client_phone: '+356 9999 7777',
        message: 'Could you provide more details about the maintenance fees and building amenities?',
        inquiry_type: 'information_request',
        status: 'contacted',
        priority: 'medium',
        preferred_viewing_date: null,
        preferred_viewing_time: null,
        offer_amount: null,
        source: 'website',
        notes: 'Interested in high-end properties',
        response_sent: true,
        response_sent_at: new Date('2024-01-26T11:00:00'),
        followed_up: false,
        followed_up_at: null,
        created_at: new Date('2024-01-26T10:45:00'),
        updated_at: new Date('2024-01-26T11:00:00')
      },
      {
        id: uuidv4(),
        property_id: properties[1].id,
        agent_id: agents[2].id,
        client_name: 'Richard Brown',
        client_email: 'richard.brown@example.com',
        client_phone: '+356 9999 8888',
        message: 'I would like to make an offer on this property. Please contact me to discuss.',
        inquiry_type: 'make_offer',
        status: 'offer_made',
        priority: 'urgent',
        preferred_viewing_date: null,
        preferred_viewing_time: null,
        offer_amount: 850000.00,
        source: 'referral',
        notes: 'Serious buyer, cash offer',
        response_sent: true,
        response_sent_at: new Date('2024-01-27T08:00:00'),
        followed_up: true,
        followed_up_at: new Date('2024-01-27T15:30:00'),
        created_at: new Date('2024-01-27T07:45:00'),
        updated_at: new Date('2024-01-27T15:30:00')
      },
      {
        id: uuidv4(),
        property_id: properties[2].id,
        agent_id: agents[1].id,
        client_name: 'Laura Martinez',
        client_email: 'laura.martinez@example.com',
        client_phone: '+356 9999 9999',
        message: 'Is this office space available for immediate occupation? Our company is expanding.',
        inquiry_type: 'information_request',
        status: 'in_progress',
        priority: 'high',
        preferred_viewing_date: new Date('2024-02-05T14:00:00'),
        preferred_viewing_time: 'afternoon',
        offer_amount: null,
        source: 'website',
        notes: 'Corporate client, needs quick turnaround',
        response_sent: true,
        response_sent_at: new Date('2024-01-28T10:15:00'),
        followed_up: true,
        followed_up_at: new Date('2024-01-29T09:00:00'),
        created_at: new Date('2024-01-28T10:00:00'),
        updated_at: new Date('2024-01-29T09:00:00')
      },
      {
        id: uuidv4(),
        property_id: properties[3].id,
        agent_id: agents[2].id,
        client_name: 'David Lee',
        client_email: 'david.lee@example.com',
        client_phone: '+356 9999 1234',
        message: 'I love historic properties. Can I view this townhouse next week?',
        inquiry_type: 'viewing_request',
        status: 'new',
        priority: 'medium',
        preferred_viewing_date: new Date('2024-02-08T11:00:00'),
        preferred_viewing_time: 'morning',
        offer_amount: null,
        source: 'social_media',
        notes: null,
        response_sent: false,
        response_sent_at: null,
        followed_up: false,
        followed_up_at: null,
        created_at: new Date('2024-01-29T16:30:00'),
        updated_at: new Date('2024-01-29T16:30:00')
      },
      {
        id: uuidv4(),
        property_id: properties[4].id,
        agent_id: agents[0].id,
        client_name: 'Sophie Turner',
        client_email: 'sophie.turner@example.com',
        client_phone: '+356 9999 5678',
        message: 'Please call me back to discuss this property. I am very interested.',
        inquiry_type: 'callback_request',
        status: 'contacted',
        priority: 'high',
        preferred_viewing_date: null,
        preferred_viewing_time: null,
        offer_amount: null,
        source: 'phone',
        notes: 'Prefer phone communication',
        response_sent: true,
        response_sent_at: new Date('2024-01-30T09:45:00'),
        followed_up: false,
        followed_up_at: null,
        created_at: new Date('2024-01-30T09:30:00'),
        updated_at: new Date('2024-01-30T09:45:00')
      },
      {
        id: uuidv4(),
        property_id: properties[0].id,
        agent_id: agents[0].id,
        client_name: 'James Wilson',
        client_email: 'james.wilson@example.com',
        client_phone: '+356 9999 4321',
        message: 'Is the price negotiable? What is the best you can do?',
        inquiry_type: 'general',
        status: 'contacted',
        priority: 'low',
        preferred_viewing_date: null,
        preferred_viewing_time: null,
        offer_amount: null,
        source: 'website',
        notes: 'Price sensitive buyer',
        response_sent: true,
        response_sent_at: new Date('2024-01-31T11:00:00'),
        followed_up: false,
        followed_up_at: null,
        created_at: new Date('2024-01-31T10:45:00'),
        updated_at: new Date('2024-01-31T11:00:00')
      },
      {
        id: uuidv4(),
        property_id: properties[4].id,
        agent_id: agents[0].id,
        client_name: 'Isabella Rossi',
        client_email: 'isabella.rossi@example.com',
        client_phone: '+356 9999 8765',
        message: 'Beautiful villa! I would like to see it as soon as possible with my family.',
        inquiry_type: 'viewing_request',
        status: 'new',
        priority: 'medium',
        preferred_viewing_date: new Date('2024-02-12T15:00:00'),
        preferred_viewing_time: 'afternoon',
        offer_amount: null,
        source: 'email',
        notes: null,
        response_sent: false,
        response_sent_at: null,
        followed_up: false,
        followed_up_at: null,
        created_at: new Date('2024-02-01T13:20:00'),
        updated_at: new Date('2024-02-01T13:20:00')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('inquiries', null, {});
  }
};
