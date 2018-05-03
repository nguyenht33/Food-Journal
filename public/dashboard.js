function getUsersEntries() {
	const user = JSON.parse(localStorage.getItem('user')),
				authToken = JSON.parse(localStorage.getItem('authToken'));

	$.ajax({
		url: `/api/entries/${user._id}`,
		type: 'GET',
		contentType: 'application/json',
		headers: {'Authorization': `Bearer ${authToken}`},
		dataType: 'json',
		success: storeUsersEntries,
		error: function(err) {
			console.log(err);
		}
	});
}

function storeUsersEntries(res) {
	localStorage.setItem('entries', JSON.stringify(res));
	console.log('got data');
}

function getTodayEntry(entryId) {

		window.location = '/entry';


	const user = JSON.parse(localStorage.getItem('user')),
				authToken = JSON.parse(localStorage.getItem('authToken'));

	$.ajax({
		url: `/api/entries/${entryId}/`,
		type: 'GET',
		contentType: 'application/json',
		headers: {'Authorization': `Bearer ${authToken}`},
		dataType: 'json',
		success: function (res) {
			console.log(res);
		},
		error: function(err) {
			console.log(err);
		}
	});
}

function postTodayEntry(userId) {

}



function todayEntryClicked() {
	$('.today-entry').click((e) => {

		let today = moment().toISOString();
		let date = today.slice(0, 10);
				date += 'T04:00:00.000Z';

		const entries = JSON.parse(localStorage.getItem('entries')),
					user = JSON.parse(localStorage.getItem('user')),
					todayEntry = entries.find(entry => entry.date === date),
					userId = user._id;

		if (todayEntry) {
			getTodayEntry(todayEntry._id)
		} else {
			postTodayEntry(userId)
		}
	});
}

function init() {
	getUsersEntries();
	todayEntryClicked();
}

$(init)



