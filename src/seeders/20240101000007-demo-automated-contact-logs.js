'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get property, inquiry, and agent IDs
    const properties = await queryInterface.sequelize.query(
      `SELECT id FROM properties ORDER BY created_at LIMIT 5`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const inquiries = await queryInterface.sequelize.query(
      `SELECT id FROM inquiries ORDER BY created_at LIMIT 5`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const agents = await queryInterface.sequelize.query(
      `SELECT id FROM agents ORDER BY created_at LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (properties.length < 3 || inquiries.length < 3 || agents.length < 3) {
      console.log('Not enough properties, inquiries, or agents found. Please run previous seeders first.');
      return;
    }

    await queryInterface.bulkInsert('automated_contact_logs', [
      {
        id: uuidv4(),
        property_id: properties[0].id,
        inquiry_id: inquiries[0].id,
        agent_id: agents[0].id,
        contact_type: 'email',
        recipient_email: 'thomas.anderson@example.com',
        recipient_phone: null,
        recipient_name: 'Thomas Anderson',
        subject: 'Viewing Confirmation - Apartment in Valletta',
        message: 'Dear Thomas,\n\nThank you for your interest in our property. Your viewing is confirmed for February 10th at 10:00 AM.\n\nBest regards,\nMalta Real Estate',
        template_name: 'viewing_confirmation',
        template_variables: JSON.stringify({
          client_name: 'Thomas',
          property_title: 'Stunning 3-Bedroom Apartment in Valletta',
          viewing_date: '2024-02-10',
          viewing_time: '10:00 AM',
          agent_name: 'John Smith'
        }),
        status: 'delivered',
        sent_at: new Date('2024-01-25T09:35:00'),
        delivered_at: new Date('2024-01-25T09:36:00'),
        opened_at: new Date('2024-01-25T10:15:00'),
        clicked_at: new Date('2024-01-25T10:16:00'),
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        automation_trigger: 'viewing_scheduled',
        metadata: JSON.stringify({ email_id: 'em_123456' }),
        external_id: 'sendgrid_abc123',
        created_at: new Date('2024-01-25T09:35:00'),
        updated_at: new Date('2024-01-25T10:16:00')
      },
      {
        id: uuidv4(),
        property_id: properties[1].id,
        inquiry_id: inquiries[1].id,
        agent_id: agents[0].id,
        contact_type: 'email',
        recipient_email: 'emily.watson@example.com',
        recipient_phone: null,
        recipient_name: 'Emily Watson',
        subject: 'Property Information - Luxury Penthouse in Sliema',
        message: 'Dear Emily,\n\nThank you for your inquiry. Here are the details you requested about the penthouse...\n\nBest regards,\nMalta Real Estate',
        template_name: 'information_response',
        template_variables: JSON.stringify({
          client_name: 'Emily',
          property_title: 'Luxury Penthouse with Sea Views in Sliema',
          agent_name: 'John Smith'
        }),
        status: 'opened',
        sent_at: new Date('2024-01-26T11:05:00'),
        delivered_at: new Date('2024-01-26T11:06:00'),
        opened_at: new Date('2024-01-26T14:20:00'),
        clicked_at: null,
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        automation_trigger: 'inquiry_received',
        metadata: JSON.stringify({ email_id: 'em_123457' }),
        external_id: 'sendgrid_abc124',
        created_at: new Date('2024-01-26T11:05:00'),
        updated_at: new Date('2024-01-26T14:20:00')
      },
      {
        id: uuidv4(),
        property_id: properties[1].id,
        inquiry_id: inquiries[2].id,
        agent_id: agents[2].id,
        contact_type: 'email',
        recipient_email: 'richard.brown@example.com',
        recipient_phone: null,
        recipient_name: 'Richard Brown',
        subject: 'Offer Received - Luxury Penthouse in Sliema',
        message: 'Dear Richard,\n\nThank you for your offer. We will review it with the owner and get back to you shortly.\n\nBest regards,\nMalta Real Estate',
        template_name: 'offer_acknowledgment',
        template_variables: JSON.stringify({
          client_name: 'Richard',
          property_title: 'Luxury Penthouse with Sea Views in Sliema',
          offer_amount: '850000.00',
          agent_name: 'David Borg'
        }),
        status: 'delivered',
        sent_at: new Date('2024-01-27T08:05:00'),
        delivered_at: new Date('2024-01-27T08:06:00'),
        opened_at: new Date('2024-01-27T08:30:00'),
        clicked_at: null,
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        automation_trigger: 'offer_received',
        metadata: JSON.stringify({ email_id: 'em_123458' }),
        external_id: 'sendgrid_abc125',
        created_at: new Date('2024-01-27T08:05:00'),
        updated_at: new Date('2024-01-27T08:30:00')
      },
      {
        id: uuidv4(),
        property_id: properties[2].id,
        inquiry_id: inquiries[3].id,
        agent_id: agents[1].id,
        contact_type: 'sms',
        recipient_email: null,
        recipient_phone: '+356 9999 9999',
        recipient_name: 'Laura Martinez',
        subject: null,
        message: 'Hi Laura, thanks for your inquiry about our office space. I will call you shortly to discuss details. - Maria Garcia, Malta Real Estate',
        template_name: 'sms_followup',
        template_variables: JSON.stringify({
          client_name: 'Laura',
          agent_name: 'Maria Garcia'
        }),
        status: 'delivered',
        sent_at: new Date('2024-01-28T10:20:00'),
        delivered_at: new Date('2024-01-28T10:21:00'),
        opened_at: null,
        clicked_at: null,
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        automation_trigger: 'inquiry_received',
        metadata: JSON.stringify({ sms_id: 'sms_789012' }),
        external_id: 'twilio_xyz123',
        created_at: new Date('2024-01-28T10:20:00'),
        updated_at: new Date('2024-01-28T10:21:00')
      },
      {
        id: uuidv4(),
        property_id: properties[0].id,
        inquiry_id: null,
        agent_id: agents[0].id,
        contact_type: 'system_notification',
        recipient_email: 'john.smith@maltarealestate.com',
        recipient_phone: null,
        recipient_name: 'John Smith',
        subject: 'Price Update Notification',
        message: 'Property "Stunning 3-Bedroom Apartment in Valletta" price has been updated from €370,000 to €350,000.',
        template_name: 'agent_price_alert',
        template_variables: JSON.stringify({
          property_title: 'Stunning 3-Bedroom Apartment in Valletta',
          old_price: '370000',
          new_price: '350000'
        }),
        status: 'sent',
        sent_at: new Date('2024-01-20T09:06:00'),
        delivered_at: new Date('2024-01-20T09:06:00'),
        opened_at: null,
        clicked_at: null,
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        automation_trigger: 'price_change',
        metadata: JSON.stringify({ notification_type: 'internal' }),
        external_id: null,
        created_at: new Date('2024-01-20T09:06:00'),
        updated_at: new Date('2024-01-20T09:06:00')
      },
      {
        id: uuidv4(),
        property_id: properties[4].id,
        inquiry_id: inquiries[4].id,
        agent_id: agents[0].id,
        contact_type: 'email',
        recipient_email: 'sophie.turner@example.com',
        recipient_phone: null,
        recipient_name: 'Sophie Turner',
        subject: 'Thank you for your inquiry - Villa in Mellieha',
        message: 'Dear Sophie,\n\nThank you for your interest. I will call you back as requested to discuss the villa.\n\nBest regards,\nJohn Smith',
        template_name: 'callback_confirmation',
        template_variables: JSON.stringify({
          client_name: 'Sophie',
          property_title: 'Modern Villa with Pool in Mellieha',
          agent_name: 'John Smith'
        }),
        status: 'delivered',
        sent_at: new Date('2024-01-30T09:50:00'),
        delivered_at: new Date('2024-01-30T09:51:00'),
        opened_at: new Date('2024-01-30T10:05:00'),
        clicked_at: null,
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        automation_trigger: 'callback_request',
        metadata: JSON.stringify({ email_id: 'em_123459' }),
        external_id: 'sendgrid_abc126',
        created_at: new Date('2024-01-30T09:50:00'),
        updated_at: new Date('2024-01-30T10:05:00')
      },
      {
        id: uuidv4(),
        property_id: properties[1].id,
        inquiry_id: null,
        agent_id: null,
        contact_type: 'email',
        recipient_email: 'marketing@maltarealestate.com',
        recipient_phone: null,
        recipient_name: 'Marketing Team',
        subject: 'New Featured Property Alert',
        message: 'A new property has been marked as featured: Luxury Penthouse with Sea Views in Sliema. Please update marketing materials.',
        template_name: 'internal_featured_alert',
        template_variables: JSON.stringify({
          property_title: 'Luxury Penthouse with Sea Views in Sliema',
          property_id: properties[1].id
        }),
        status: 'sent',
        sent_at: new Date('2024-01-25T08:03:00'),
        delivered_at: new Date('2024-01-25T08:03:00'),
        opened_at: null,
        clicked_at: null,
        error_message: null,
        retry_count: 0,
        max_retries: 3,
        automation_trigger: 'featured_update',
        metadata: JSON.stringify({ notification_type: 'internal', department: 'marketing' }),
        external_id: null,
        created_at: new Date('2024-01-25T08:03:00'),
        updated_at: new Date('2024-01-25T08:03:00')
      },
      {
        id: uuidv4(),
        property_id: properties[3].id,
        inquiry_id: null,
        agent_id: agents[2].id,
        contact_type: 'push_notification',
        recipient_email: null,
        recipient_phone: null,
        recipient_name: 'David Borg',
        subject: null,
        message: 'Property status changed to "Under Offer" - Traditional Townhouse in Historic Mdina',
        template_name: 'agent_status_alert',
        template_variables: JSON.stringify({
          property_title: 'Traditional Townhouse in Historic Mdina',
          new_status: 'under_offer'
        }),
        status: 'failed',
        sent_at: new Date('2024-01-27T11:04:00'),
        delivered_at: null,
        opened_at: null,
        clicked_at: null,
        error_message: 'Push notification service unavailable',
        retry_count: 2,
        max_retries: 3,
        automation_trigger: 'status_change',
        metadata: JSON.stringify({ device_token: 'fcm_token_123' }),
        external_id: null,
        created_at: new Date('2024-01-27T11:04:00'),
        updated_at: new Date('2024-01-27T11:10:00')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('automated_contact_logs', null, {});
  }
};
