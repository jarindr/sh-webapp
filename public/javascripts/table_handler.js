$(document).ready(function() {
    var boolean = false;
    var current = 0;
    $('.queue_data').load('queue_table?data=' + current).hide().fadeIn();
    $('#next').click(function() {
        current++;
        $('.queue_data').fadeOut("fast", function() {
            $(this).load('queue_table?data=' + current).hide().fadeIn();
        });
    });
    $('#previous').click(function() {
        current--;
        $('.queue_data').fadeOut("fast", function() {
            $(this).load('queue_table?data=' + current).hide().fadeIn();
        });
    });

});