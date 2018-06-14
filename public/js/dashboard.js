let MonthEntries;
let TargetWeek;

function init() {
	displayHeader();
	todayEntryClicked();
	previousEntryClicked();
	monthClicked();
	hideMonthClicked();
	weekClicked();
	logOutClicked();
}

function displayHeader() {
	const user = JSON.parse(localStorage.getItem('user'));
	const firstname = user.firstname;
	const template = `<div class="header-container">
											<div class="header-box">
												<div>
													<a href="/dashboard"><i class="icon-journal"></i></a>
													<h4>${firstname}'s journal</h4>
												</div>
												<div>
													<a id="logout">log out</a>
												</div>
											</div>
										</div>`
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
		$('.calendar').toggleClass('show');
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
			alert('Something went wrong');
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
				const entryDate = week[0].date;
				const startDate = moment(entryDate).startOf('week').format('MMMM DD');
				const endDate = moment(entryDate).endOf('week').format('MMMM DD');

				const weekObj = {week: num, date: week[0].date, startDate: startDate, endDate: endDate};
				entries.push(weekObj);
			}
		});

		const weeksTemplate = 
		`${entries.map((entry) => 
			`<div class="week">
				<div class="week-left">
					<h4>Week ${entry.week}</h4>
					<p>${entry.startDate} - ${entry.endDate}</p>
				</div>
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

function logOutClicked() {
	$('body').on('click', '#logout', (e) => {
  	document.cookie = 'authToken=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
		window.location = '/';
	});
}

$(init)



