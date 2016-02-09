$(document).ready(function() {
	$.post('/queue_data', function(queue, textStatus, xhr) {
		function loopAddRoom(arr, starter, callback) {
			disableAll();
			myRoomTab.addTab(function() {
				// set x to next item
				starter++;
				// any more items in array? continue loop
				if (starter < arr.length) { // call back when loops end
					loopAddRoom(arr, starter, function() {
						disableAll();
						$(".nav-tabs li:nth-last-child(2) a").tab('show');
						$(".loading-modal").fadeOut('slow');

					});
				} else {
					disableAll();
					$(".loading-modal").fadeOut('slow');
					callback()

				}
			}, arr[starter], queue.assignment);
		}

		loopAddRoom(queue.subQueue, 0);
	});


});

function disableAll() {
	$("input").prop("readonly", true);
	$("select").prop("disabled", true);
	$("textarea").prop("readonly", true);
	$(".datepicker").find("td").off();
	$(".ui-datepicker-next").click(function() {
		$(".datepicker").find("td").off();
	});
	$(".ui-datepicker-prev").click(function() {
		$(".datepicker").find("td").off();
	});
	$(".add-room a").hide();
	$(".close").hide();
	$(".add_assistant").hide();
	$(".delete_assistant").hide();
	$(".button_decrease").hide();
	$(".button_increase").hide();
	$(".submit_queue").hide();
}