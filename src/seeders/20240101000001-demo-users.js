'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);
    
    const userIds = {
      admin: uuidv4(),
      agent1: uuidv4(),
      agent2: uuidv4(),
      agent3: uuidv4(),
      user1: uuidv4(),
      user2: uuidv4()
    };

    await queryInterface.bulkInsert('users', [
      {
        id: userIds.admin,
        email: 'admin@maltarealestate.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: userIds.agent1,
        email: 'john.smith@maltarealestate.com',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Smith',
        role: 'agent',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: userIds.agent2,
        email: 'maria.garcia@maltarealestate.com',
        password: hashedPassword,
        first_name: 'Maria',
        last_name: 'Garcia',
        role: 'agent',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: userIds.agent3,
        email: 'david.borg@maltarealestate.com',
        password: hashedPassword,
        first_name: 'David',
        last_name: 'Borg',
        role: 'agent',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: userIds.user1,
        email: 'client1@example.com',
        password: hashedPassword,
        first_name: 'Michael',
        last_name: 'Johnson',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: userIds.user2,
        email: 'client2@example.com',
        password: hashedPassword,
        first_name: 'Sarah',
        last_name: 'Williams',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Store user IDs for other seeders
    return { userIds };
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
