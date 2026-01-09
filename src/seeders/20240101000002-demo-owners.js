'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const ownerIds = {
      owner1: uuidv4(),
      owner2: uuidv4(),
      owner3: uuidv4(),
      owner4: uuidv4(),
      owner5: uuidv4()
    };

    await queryInterface.bulkInsert('owners', [
      {
        id: ownerIds.owner1,
        first_name: 'Robert',
        last_name: 'Cauchi',
        email: 'robert.cauchi@example.com',
        phone: '+356 2123 4567',
        mobile: '+356 9999 1111',
        address: '15, Triq il-Kbira',
        city: 'Valletta',
        country: 'Malta',
        company_name: null,
        tax_id: null,
        notes: 'Owns multiple properties in Valletta area',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: ownerIds.owner2,
        first_name: 'Carmen',
        last_name: 'Zammit',
        email: 'carmen.zammit@example.com',
        phone: '+356 2134 5678',
        mobile: '+356 9999 2222',
        address: '42, Vjal ir-Rihan',
        city: 'Sliema',
        country: 'Malta',
        company_name: null,
        tax_id: null,
        notes: 'Interested in luxury properties',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: ownerIds.owner3,
        first_name: 'Joseph',
        last_name: 'Farrugia',
        email: 'joseph.farrugia@example.com',
        phone: '+356 2145 6789',
        mobile: '+356 9999 3333',
        address: '88, Triq San Pawl',
        city: 'St. Paul\'s Bay',
        country: 'Malta',
        company_name: 'Farrugia Properties Ltd',
        tax_id: 'MT12345678',
        notes: 'Corporate owner with multiple commercial properties',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: ownerIds.owner4,
        first_name: 'Anna',
        last_name: 'Micallef',
        email: 'anna.micallef@example.com',
        phone: '+356 2156 7890',
        mobile: '+356 9999 4444',
        address: '23, Triq il-Wied',
        city: 'Mdina',
        country: 'Malta',
        company_name: null,
        tax_id: null,
        notes: 'Heritage property owner',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: ownerIds.owner5,
        first_name: 'George',
        last_name: 'Attard',
        email: 'george.attard@example.com',
        phone: '+356 2167 8901',
        mobile: '+356 9999 5555',
        address: '56, Triq il-Bajja',
        city: 'Mellieha',
        country: 'Malta',
        company_name: null,
        tax_id: null,
        notes: 'Vacation rental properties',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Store owner IDs for other seeders
    return { ownerIds };
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('owners', null, {});
  }
};
