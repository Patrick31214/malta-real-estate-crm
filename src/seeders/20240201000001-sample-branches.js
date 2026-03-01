'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('branches', [
      {
        id: uuidv4(),
        name: 'Malta HQ',
        city: 'Valletta',
        country: 'Malta',
        address: '123 Republic Street, Valletta',
        phone: '+35621234567',
        email: 'valletta@goldenkey.mt',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Gozo Office',
        city: 'Victoria',
        country: 'Malta',
        address: '45 Republic Street, Victoria, Gozo',
        phone: '+35622345678',
        email: 'gozo@goldenkey.mt',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sliema Branch',
        city: 'Sliema',
        country: 'Malta',
        address: '78 The Strand, Sliema',
        phone: '+35623456789',
        email: 'sliema@goldenkey.mt',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('branches', null, {});
  }
};
