$(document).ready(function() {
    $(".table-loop").find("tr").each(function(index, el) {
        var day = $(this).find("#date").text().substring(0, 3);
        if (day == "Mon") {
            $(this).css('background-color', '#F5FDB0');
        }
        if (day == "Tue") {
            $(this).css('background-color', '#FFC2F4');
        }
        if (day == "Wed") {
            $(this).css('background-color', '#9BFFAB');
        }
        if (day == "Thu") {
            $(this).css('background-color', '#FFE7BA');
        }
        if (day == "Fri") {
            $(this).css('background-color', '#D0F2FF');
        }
        if (day == "Sat") {
            $(this).css('background-color', '#E5C2FB');
        }
        if (day == "Sun") {
            $(this).css('background-color', '#FFC1C1');
        }
    });
    $(".table-data").hover(function() {
        $(this).css('-webkit-filter', 'brightness(90%');
    }, function() {
        $(this).css('-webkit-filter', 'brightness(100%');
    });
});