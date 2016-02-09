$(document).ready(function() {
	$.post('/queue_data', function(queue, textStatus, xhr) {
		function loopAddRoom(arr, starter, callback) {
			myRoomTab.addTab(function() {
				// set x to next item
				starter++;
				// any more items in array? continue loop
				if (starter < arr.length) { // call back when loops end
					loopAddRoom(arr, starter, function() {
						$(".nav-tabs li:nth-last-child(2) a").tab('show');
						$(".loading-modal").fadeOut('slow');

					});
				} else {
					$(".loading-modal").fadeOut('slow');
					callback()

				}
			}, arr[starter], queue.assignment);
		}

		loopAddRoom(queue.subQueue, 0);
	});


});