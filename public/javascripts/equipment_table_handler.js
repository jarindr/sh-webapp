$(document).ready(function() {
    var url = "equipment_table";
    var count = false;
    $('.equipment_table').load("equipment_table_count?catagories=Profoto").hide().fadeIn();
    var value = encodeURIComponent($("#sort_equip").val());
    $("#sort_equip").change(function(event) {
        value = encodeURIComponent($(this).val());
        $('.equipment_table').load('equipment_table_count?catagories=' + value + "&count=" + count).hide().fadeIn();
    });
    $("#count").click(function(event) {
        if (count) {
            $("#count").text("view as unique");
            $('.equipment_table').load('equipment_table_count?catagories=' + value + "&count=" + count).hide().fadeIn();
        } else {
            $("#count").text("view as count");
            $('.equipment_table').load('equipment_table?catagories=' + value + "&count=" + count).hide().fadeIn();
        }
        count = !count;

    });

});