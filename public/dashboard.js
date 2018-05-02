function getUsersEntries() {
	const user = JSON.parse(localStorage.getItem('user'));
	const authToken = JSON.parse(localStorage.getItem('authToken'));

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
}

function init() {
	console.log('working');
	getUsersEntries();
}

$(init)



