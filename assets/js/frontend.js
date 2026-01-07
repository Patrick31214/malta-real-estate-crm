/**
 * Frontend JavaScript for Malta Real Estate CRM
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        // Property search form
        $('.property-search-form').on('submit', function(e) {
            e.preventDefault();
            
            var formData = $(this).serialize();
            
            // TODO: Implement AJAX search or redirect to search results
            console.log('Search submitted:', formData);
        });

        // Contact form submission
        $('.malta-re-contact-form .contact-form').on('submit', function(e) {
            e.preventDefault();
            
            var $form = $(this);
            var $submitBtn = $form.find('.submit-button');
            var nonce = $form.data('nonce');
            
            var formData = {
                first_name: $form.find('#first_name').val(),
                last_name: $form.find('#last_name').val(),
                email: $form.find('#email').val(),
                phone: $form.find('#phone').val(),
                contact_type: 'lead',
                status: 'active',
                notes: $form.find('#message').val()
            };
            
            $submitBtn.prop('disabled', true).text('Sending...');
            
            $.ajax({
                url: maltaRECRM.restUrl + '/contacts',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', nonce);
                },
                success: function(response) {
                    $form[0].reset();
                    alert('Thank you! Your message has been sent successfully.');
                },
                error: function(xhr, status, error) {
                    alert('Error sending message. Please try again.');
                },
                complete: function() {
                    $submitBtn.prop('disabled', false).text('Send Message');
                }
            });
        });

        // Property card click handling
        $('.malta-re-property-card').on('click', function() {
            // TODO: Navigate to property detail page
            console.log('Property card clicked');
        });
    });

})(jQuery);
