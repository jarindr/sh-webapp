$(document).ready(function () {
    $(".btn").mouseup(function () {
        $(this).blur();
    });
    var bookingApp = {
        initialize: function () {
            bookingApp.setSubnavHandler();
            $(".main-app-room").load("/room_new_queue", $("#assignment-selector").val());
            $(".main-app-equipment").load("/equipment_new_queue");
        },
        setSubnavHandler: function () {
            $(".sub-nav").click(function (event) {
                $(this).removeClass('btn-default').addClass('btn-success');
                $(".sub-nav").not(this).removeClass('btn-success').addClass('btn-default');
                if ($(this).text() == "Booking") {
                    $(".main-app").show('fast');
                    $(".main-app-equipment").hide('fast');
                    $(".main-app-room").hide('fast');
                } else if ($(this).text() == "Rooms" || $(this).text() == "Dates and other") {
                    $(".main-app").hide('fast');
                    $(".main-app-equipment").hide('fast');
                    $(".main-app-room").show('fast');
                } else if ($(this).text() == "Equipment") {
                    $(".main-app").hide('fast');
                    $(".main-app-equipment").show('fast');
                    $(".main-app-room").hide('show');
                }
            });
        }
    }
    bookingApp.initialize();


    // get all data and save as queue object

    $(document).on("change", "#assignment_selector", function () {
        if ($('#assignment_selector').val() == "Onscreen room") {
            $("#next_current_equipment").hide();
            $("#equip-sub-nav").hide('fast');
        } else {
            if ($('#assignment_selector').val() == "Equipment rental") {
                $("#room-sub-nav").text("Dates and other");
            } else {
                $("#room-sub-nav").text("Rooms");
            }
            $("#next_current_equipment").show();
            $("#equip-sub-nav").show('fast');
        }
    });

    function setActiveSubNav(current) { // a function to set the sub-nav activation color
        $(".btn-breadcrumb").find("a").each(function (index, el) {
            if ($(el).text() == current) {
                $(el).removeClass('btn-default').addClass('btn-success');
            } else {
                $(el).removeClass('btn-success').addClass('btn-default');
            }
        });
    }

    $(document).on("click", "#next_current_room", function (event) {
        $(".main-app").hide(); // hide the main-app after click 
        $(".main-app-room").show();
        $(".main-app-equipment").hide();
        if ($('#assignment_selector').val() == "Equipment rental") {
            setActiveSubNav("Dates and other");
        } else {
            setActiveSubNav("Rooms");
        }
    });

    $(document).on("click", "#next_current_equipment", function (event) {
        $(".main-app").hide(); // hide the main-app after click 
        $(".main-app-room").hide();
        $(".main-app-equipment").show();
        setActiveSubNav("Equipment");
    });
    $(document).on("click", ".closex", function (event) {
        $(".alert-trigger").fadeOut('fast');
    });


});