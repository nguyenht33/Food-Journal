// function getTodayEntry(entryId) {
// 	$.ajax({
// 		url: `/api/entries/${entryId}/`,
// 		type: 'GET',
// 		contentType: 'application/json',
// 		dataType: 'json',
// 		success: displayEntry,
// 		error: function(err) {
// 			console.log(err);
// 		}
// 	});
// }

// post entry for today
function postTodayEntry(userId, todaysDate) {
	$.ajax({
		url: `/api/entries/new/${userId}/`,
		type: 'POST',
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify({ 
						date: todaysDate, 
						meal_list: [],
					}),
		success: storeToWeekly,
		error: function(err) {
			console.log(err);
		}
	});
}

// store posted entry to 7 days data storage
function storeToWeekly(entry) {
	let weeklyEntries = [];
	weeklyEntries = JSON.parse(localStorage.getItem('weekly_entries'));
	weeklyEntries['entries'].push(entry);

	localStorage.setItem('weekly_entries', JSON.stringify(weeklyEntries));
	return checkForTodaysEntry();
}

// get entries for 7 days
function getWeeklyEntries(userId, startDate, endDate) {
	$.ajax({
		url: `/api/entries/date/${userId}/`,
		type: 'GET',
		data: {
			startDate: startDate,
			endDate: endDate
		},
		contentType: 'application/json',
		dataType: 'json',
		success: storeWeeklyEntry,
		error: function(err) {
			console.log(err);
		}
	});
}

// store 7 days data to local storage
function storeWeeklyEntry(entry) {
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	const today = moment().startOf('day').toISOString();

	if (entry) {
		localStorage.setItem('weekly_entries', JSON.stringify(entry));
		return checkForTodaysEntry();
	} else {
		postTodayEntry(userId, today);
	};
}

function checkForTodaysEntry() {
	const weeklyEntries = JSON.parse(localStorage.getItem('weekly_entries'));
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	const todaysDate = moment().startOf('day').toISOString();

	let todaysEntry = weeklyEntries['entries'].find(e => e.date === todaysDate);

	if (todaysEntry) {
		displayEntry(todaysEntry);
	} else {
		postTodayEntry(userId, todaysDate);
	}
}

function displayEntry(todaysEntry) {
	console.log(todaysEntry);
}

function todayEntryClicked() {
	$('.today-entry').click((e) => {
		e.preventDefault();
		const user = JSON.parse(localStorage.getItem('user'));
		const userId = user._id;

		const today = moment().startOf('day').toISOString();
		const startDate = moment().startOf('day').subtract(7, 'day').toISOString();
		const endDate = today;

		getWeeklyEntries(userId, startDate, endDate);
	});
}

function init() {
	todayEntryClicked();
}

$(init)



