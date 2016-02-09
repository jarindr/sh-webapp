$(document).ready(function() {
    function queue() {
        this.qid;
        this.client;
        this.job_description;
        this.assignment;
        this.subQueue = [];


    }

    function subQueue() {
        this.room;
        this.photographer;
        this.shooting_date;
        this.status;
        this.time;
        this.assistant = [];
        this.equipments = {};
    }

    var sendQueue = function() {
        var osIndex;
        var Queue = new queue();
        Queue.qid = $("#quotation_number").val();
        $("input[name='client_form']").each(function(index, el) {
            Queue.client = $(el).val();
        });
        $("textarea[name='job_description_form']").each(function(index, el) {
            Queue.job_description = $(el).val();
        });
        $("select[name='assignment_selector']").each(function(index, el) {
            Queue.assignment = $(el).val();
        });
        $(".room-selector").each(function(index, el) { // room
            var sq = new subQueue();
            var room = $(el).val();
            if (room == "Onscreen room") osIndex = index;
            sq.room = room;
            Queue.subQueue.push(sq);
        });

        $("input[name='Photographer_form']").each(function(index1, el1) {
            Queue.subQueue[index1].photographer = $(el1).val();
            $(el1).parent().parent().parent().find("input[name='assistant_form']").each(function(index2, el2) {
                Queue.subQueue[index1].assistant.push($(el2).val());

            });
        });

        $("select[name='status_selector']").each(function(index, el) {
            Queue.subQueue[index].status = $(el).val();
        });
        $("select[name='time_form']").each(function(index, el) {
            Queue.subQueue[index].time = $(el).val();
        });
        $('.datepicker').each(function(index, el) {
            var dates = $(el).multiDatesPicker('getDates');
            Queue.subQueue[index].shooting_date = dates;
        });
        var indexEq = 0;

        var pass = true;
        $('.datepicker').each(function(index, el) {
            var dates = $(el).multiDatesPicker('getDates');
            if (dates.length == 0) {
                pass = false;
            }
        });
        // only if type assignment != onscreen since onscreen doesn't have equipment
        if ($("#assignment_selector").val() != "Onscreen room") {
            $(".tab-e").each(function(index, el) {
                $(el).find(".list-group-item").each(function(index2, el2) {
                    var items = $(this).text().substring(0, $(this).text().lastIndexOf("+")).trim();
                    var val = $(this).find('input').val();
                    if (val != 0) {
                        Queue.subQueue[index].equipments[items] = val;
                    }
                });
            });
        }
        if (pass) {
            // post Queue to server and get respond if success of failed.
            $.post('http://localhost:3000/update_queue', Queue, function(failed, textStatus, xhr) {
                if (failed) { // failed
                    window.location = "http://localhost:3000/error";
                } else {
                    window.location = "http://localhost:3000/confirm_create_queue";
                }
            });
        } else {
            $(".alert-trigger").show();
        }
    }
    $(document).on("click", "#submit_queue", sendQueue);

});