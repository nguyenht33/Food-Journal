let MonthEntries;
let TargetWeek;

function init() {
	displayHeader();
	todayEntryClicked();
	previousEntryClicked();
	monthClicked();
	hideMonthClicked();
	weekClicked();
}

function displayHeader() {
	const user = JSON.parse(localStorage.getItem('user'));
	const firstname = user.firstname;
	const template = `<h4>${firstname}'s journal</h4>
										<a>Log Out<a/>`
	$('header').html(template);
}

function todayEntryClicked() {
	$('.today-entry').click(e => {
		e.preventDefault();
		TargetWeek = null;
		localStorage.setItem('TargetWeek', TargetWeek);
		window.location = '/entry';
	});
}

function previousEntryClicked() {
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	$('.previous-entry').click(e => {
		getEntries(userId);
	});
}

function getEntries(userId) {
	$.ajax({
		url: `/api/entries/months/${userId}`,
		type: 'GET',
		contentType: 'application/json',
		dataType: 'json',
		success: displayMonths,
		error: function(err) {
			console.log(err);
		}
	});
}

function displayMonths(entries) {
	const entriesArr = entries.map(e => {
		const month = moment(e.date).format('MMMM');
		const date = moment(e.date);
		const week = weekOfMonth(date);
		return {month: month, date: e.date, week: week}
	});
	MonthEntries = entriesArr;

	const entryMonths = entries.map(e => {
		return moment(e.date).format('MMMM');
	});
	const monthsSet = new Set(entryMonths);
	const months = Array.from(monthsSet);

	const monthsTemplate = `${months.map(
		month => `<div class="month-container">
								<input type="button" value="${month}" class="month-btn">
								<div class="week-container"></div>
							</div>`).join("")}`;
	$('.calendar').html(monthsTemplate);
}

function monthClicked() {
	$('main').on('click', '.month-btn', (e) => {
		const monthInput = $(e.target).val();
		const month = MonthEntries.filter(e => e.month === monthInput);

		let entries = [];
		const weeksNum = [1, 2, 3, 4, 5];
		weeksNum.forEach(num => {
			const week = month.filter(e => e.week === num);
			if (week.length) {
				const weekObj = {week: num, date: week[0].date};
				entries.push(weekObj);
			}
		});

		const weeksTemplate = 
		`${entries.map((entry) => 
			`<div class="week">
				<h4>Week ${entry.week}</h4>
				<input type="button" value=">" id="${entry.date}" class="week-btn">
			</div>`).join('')}`;

		$(e.target).toggleClass('hide-btn month-btn');
		$(e.target).siblings('.week-container').show();
		$(e.target).siblings('.week-container').html(weeksTemplate);
	});
}

function hideMonthClicked() {
	$('main').on('click', '.hide-btn', (e) => {
		$(e.target).toggleClass('hide-btn month-btn');
		$(e.target).siblings('.week-container').hide();
	});
}

function weekClicked() {
	$('main').on('click','.week-btn', (e) => {
		const date = $(e.target).attr('id');
		TargetWeek = date;
		localStorage.setItem('TargetWeek', JSON.stringify(TargetWeek));
		window.location = '/entry';
	});
}

function weekOfMonth(date) {
  return date.week() - moment(date).startOf('month').week() + 1;
}

$(init)



