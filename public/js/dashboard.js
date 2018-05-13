function todayEntryClicked() {
	$('.today-entry').click((e) => {
		e.preventDefault();
		window.location = '/entry';
	});
}

function init() {
	todayEntryClicked();
}

$(init)



