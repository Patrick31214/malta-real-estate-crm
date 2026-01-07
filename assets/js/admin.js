/**
 * Admin JavaScript for Malta Real Estate CRM
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        // Add property button
        $('#add-property').on('click', function(e) {
            e.preventDefault();
            // TODO: Open modal or redirect to add property form
            alert('Add property functionality would open a form here');
        });

        // Edit property button
        $('.edit-property').on('click', function(e) {
            e.preventDefault();
            var propertyId = $(this).data('id');
            // TODO: Open modal or redirect to edit property form
            alert('Edit property ' + propertyId);
        });

        // Delete property button
        $('.delete-property').on('click', function(e) {
            e.preventDefault();
            if (!confirm('Are you sure you want to delete this property?')) {
                return;
            }
            
            var propertyId = $(this).data('id');
            var $row = $(this).closest('tr');
            
            $.ajax({
                url: maltaRECRM.restUrl + '/properties/' + propertyId,
                method: 'DELETE',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', maltaRECRM.nonce);
                },
                success: function(response) {
                    $row.fadeOut(function() {
                        $(this).remove();
                    });
                },
                error: function(xhr, status, error) {
                    alert('Error deleting property: ' + error);
                }
            });
        });

        // Add contact button
        $('#add-contact').on('click', function(e) {
            e.preventDefault();
            alert('Add contact functionality would open a form here');
        });

        // Edit contact button
        $('.edit-contact').on('click', function(e) {
            e.preventDefault();
            var contactId = $(this).data('id');
            alert('Edit contact ' + contactId);
        });

        // Delete contact button
        $('.delete-contact').on('click', function(e) {
            e.preventDefault();
            if (!confirm('Are you sure you want to delete this contact?')) {
                return;
            }
            
            var contactId = $(this).data('id');
            alert('Delete contact ' + contactId);
        });

        // Add agent button
        $('#add-agent').on('click', function(e) {
            e.preventDefault();
            alert('Add agent functionality would open a form here');
        });

        // Edit agent button
        $('.edit-agent').on('click', function(e) {
            e.preventDefault();
            var agentId = $(this).data('id');
            alert('Edit agent ' + agentId);
        });

        // View stats button
        $('.view-stats').on('click', function(e) {
            e.preventDefault();
            var agentId = $(this).data('id');
            alert('View stats for agent ' + agentId);
        });

        // Schedule viewing button
        $('#schedule-viewing').on('click', function(e) {
            e.preventDefault();
            alert('Schedule viewing functionality would open a form here');
        });
    });

})(jQuery);
