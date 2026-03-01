'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get user IDs from users table
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE role = 'agent' ORDER BY created_at LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length < 3) {
      console.log('Not enough agent users found. Please run demo-users seeder first.');
      return;
    }

    // Fetch branches by name (gracefully handle missing branches)
    let branches = [];
    try {
      branches = await queryInterface.sequelize.query(
        `SELECT id, name FROM branches WHERE name IN ('Malta HQ', 'Gozo Office', 'Sliema Branch')`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    } catch (e) {
      console.log('Branches table not found or query failed, skipping branch assignment.');
    }

    const branchByName = {};
    for (const b of branches) branchByName[b.name] = b.id;

    const agentIds = {
      agent1: uuidv4(),
      agent2: uuidv4(),
      agent3: uuidv4()
    };

    await queryInterface.bulkInsert('agents', [
      {
        id: agentIds.agent1,
        user_id: users[0].id,
        license_number: 'MLT-RE-2020-001',
        specialization: 'Residential Properties, Luxury Apartments',
        commission_rate: 2.50,
        phone: '+356 2123 4567',
        mobile: '+356 9999 1001',
        office_address: '45, Republic Street, Valletta, Malta',
        bio: 'Experienced real estate agent specializing in residential properties in Malta. Over 10 years of experience in the Maltese property market.',
        profile_image_url: 'https://via.placeholder.com/150',
        languages: ['English', 'Maltese', 'Italian'],
        years_experience: 10,
        is_active: true,
        ...(branchByName['Malta HQ'] ? { branch_id: branchByName['Malta HQ'] } : {}),
        manager_name: 'Admin User',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: agentIds.agent2,
        user_id: users[1].id,
        license_number: 'MLT-RE-2021-002',
        specialization: 'Commercial Properties, Office Spaces',
        commission_rate: 3.00,
        phone: '+356 2134 5678',
        mobile: '+356 9999 1002',
        office_address: '12, Tower Road, Sliema, Malta',
        bio: 'Commercial real estate specialist with expertise in office spaces and retail properties. Fluent in multiple languages.',
        profile_image_url: 'https://via.placeholder.com/150',
        languages: ['English', 'Spanish', 'Maltese'],
        years_experience: 8,
        is_active: true,
        ...(branchByName['Gozo Office'] ? { branch_id: branchByName['Gozo Office'] } : {}),
        manager_name: 'Admin User',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: agentIds.agent3,
        user_id: users[2].id,
        license_number: 'MLT-RE-2022-003',
        specialization: 'Luxury Properties, Villas, Penthouses',
        commission_rate: 2.75,
        phone: '+356 2145 6789',
        mobile: '+356 9999 1003',
        office_address: '78, Spinola Road, St. Julian\'s, Malta',
        bio: 'Luxury property expert specializing in high-end villas and penthouses. Known for exceptional client service.',
        profile_image_url: 'https://via.placeholder.com/150',
        languages: ['English', 'Maltese', 'French', 'German'],
        years_experience: 12,
        is_active: true,
        ...(branchByName['Sliema Branch'] ? { branch_id: branchByName['Sliema Branch'] } : {}),
        manager_name: 'Admin User',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Store agent IDs for other seeders
    return { agentIds };
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('agents', null, {});
  }
};
