let WeeklyEntries; // store entries for one week, use to navigate weekdays nav
let TargetEntry; // store one entry, use to display selected weekday

function init() {
	displayHeader();
	checkRoute();
	handleDropDownClicked();
	handleDayClicked();
	handleAddMeal();
	handleCloseMeal();
	handleAddDish();
	handleRemoveDish();
	handleMealSave();
	handleMealEdit();
	handleMealDelete();
}

//// CHECK IF TODAY'S ENTRY OR PREVIOUS ENTRY ROUTE ////
function checkRoute() {
	const targetWeek = JSON.parse(localStorage.getItem('TargetWeek'));
	if (targetWeek === null) {
		getThisWeeksEntries();
	} else {
		getPreviousWeeksEntries(targetWeek);
	}
}

//// GET ENTRIES FOR 7 DAYS ////
function getPreviousWeeksEntries(targetWeek) {
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	const startDate = moment(targetWeek).startOf('week').toISOString();
	let endDate;

	const compareToday = moment(targetWeek).isSame(new Date(), 'week'); 
	if (compareToday) {
		const today = moment().startOf('day').toISOString();
		endDate = today;
	} else {
		endDate = moment(targetWeek).endOf('week').toISOString();
	}

	$.ajax({
		url: `/api/entries/week/${userId}/`,
		type: 'GET',
		data: {
			startDate: startDate,
			endDate: endDate
		},
		contentType: 'application/json',
		dataType: 'json',
		success: displayPreviousEntries,
		error: function(err) {
			console.log(err);
		}
	});
}

//// GET ENTRIES FOR 7 DAYS ////
function getThisWeeksEntries() {
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	const today = moment().startOf('day').toISOString();
	const endDate = today;
	const startDate = moment(today).startOf('week').toISOString();

	$.ajax({
		url: `/api/entries/week/${userId}/`,
		type: 'GET',
		data: {
			startDate: startDate,
			endDate: endDate
		},
		contentType: 'application/json',
		dataType: 'json',
		success: displayTodayEntry,
		error: function(err) {
			console.log(err);
		}
	});
}

function displayTodayEntry(entries) {
	WeeklyEntries = entries['entries'];
	const todaysDate = moment().startOf('day').toISOString();
	const todaysEntry = entries['entries'].find(e => e.date === todaysDate);

	if (todaysEntry) {
		displayEntry(todaysEntry);
	} else {
		getEntry(todaysDate);
	}
}

function displayPreviousEntries(entries) {
	WeeklyEntries = entries['entries'];

	// displays first day of week
	const dayOfWeek = entries['entries'][0].date;
	const firstDayOfWeek = moment(dayOfWeek).locale('en-gb').weekday(dayOfWeek).startOf('week').toISOString();
	const targetEntry = entries['entries'].find(e => e.date === firstDayOfWeek);

	if (targetEntry) {
		displayEntry(targetEntry);
	} else {
		getEntry(targetEntry);
	}
}

function getEntry(date) {
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	$.ajax({
		url: `/api/entries/date/${userId}/`,
		type: 'GET',
		data: { date: date },
		contentType: 'application/json',
		dataType: 'json',
		success: displayEntry,
		error: function(err) {
			console.log(err);
		}
	});
}

///// DISPLAY WEEKDAYS NAV /////
function displayWeekdaysNav() {
	const weeklyEntries = WeeklyEntries;
	// get all entries available for this week
	const entries = weeklyEntries.map(e => {
		let entry = {};
		let entryList = [];
		let day = moment(e.date).format('dddd');
		let date = moment(e.date).format('MMMM DD, YYYY');
		let meal;
		if (e.meal_list.length) {
			meal = true;
		}
		return entry = { day: day, date: date, iso: e.date, meal: meal };
	});

	// get all days and dates for this week
	const daysIndex = [0, 1, 2, 3, 4, 5, 6];
	const weekArray = daysIndex.map(dow => {
											let day = moment().locale('en-gb').weekday(dow).format('dddd');
											let date = moment().locale('en-gb').weekday(dow).format('MMMM DD, YYYY');
											let iso = moment().locale('en-gb').weekday(dow).startOf('day').toISOString();

											entry = {day: day, date: date, iso: iso};
											return entry;
									});

	// compare weekly entries & dates for this week
	const weekDaysArray = weekArray.map(entry => entries.find(e => e.day === entry.day) || entry);
	const latestEntry = entries.slice(entries.length -1);
	const latestDay = latestEntry[0].day;
	const latestIndex = weekArray.findIndex(i => i.day === latestDay);

	// remove dates after today & today from list
	let weekDays = weekDaysArray.slice(0, latestIndex + 1);
	const targetDate = weekDays.find(e => e.iso === TargetEntry.date);
	weekDays.forEach((day, i) => {
		if (day.date === targetDate.date) {
			weekDays.splice(i, 1);
		}
	})

	const weekDaysTemplate = getWeekDaysTemplate(weekDays, targetDate);
	$('nav').html(weekDaysTemplate);
}

function getWeekDaysTemplate(weekDays, targetDate) {
	return `
		<div class="nav-container">
			<img src="../images/day-${targetDate.day}.svg" class="day-display">
			<div class="day-header">
				<h4>${targetDate.day}</h4>
				<p>${targetDate.date}</p>
			</div>
			<button>v</button>
		</div>
		<ul class="dropdown-content">
			${weekDays.map(entry => 
				`${entry.meal ? `
						<li id="${entry.iso}" class="day"><a>${entry.day}</a></li>
					` : `
						<li id="${entry.iso}" class="day gray"><a>${entry.day}</a></li>
					`}`
				).join("")}
		</ul>`;
}

function handleDropDownClicked() {
	$('nav').on('click', (e) => {
		$('.dropdown-content').toggleClass('show');
	});
}

function handleDayClicked() {
	$('nav').on('click', 'li', (e) => {
		const date = ($(e.target).attr('id'));
		getEntry(date);
	});
}

// display entry //
function displayEntry(entry) {
	// update WeeklyEntries(used to navigate weekdays)
	const targetDate = entry.date;
	const targetEntry = WeeklyEntries.findIndex(e => e.date === targetDate);

	if (targetEntry === -1) {
		WeeklyEntries.push(entry);
	} else {
		WeeklyEntries[targetEntry] = entry;
	}
	TargetEntry = entry;

	displayWeekdaysNav();

	const mealList = entry.meal_list;
	let entryTemplate, 
			mealsTemplate;

	if (mealList.length === 0) {
		entryTemplate = createAllMealsTemplate();
	} else {
		checkedMeals = checkEachMealEntry(mealList);
		entryTemplate = createEntryTemplate(checkedMeals);
	}

	$('main').html(entryTemplate);
}

function checkEachMealEntry(mealList) {
	const mealTypes = ['breakfast', 'snack_1', 'lunch', 'snack_2', 'dinner', 'snack_3'];
	const mealListTemplates = {};

	mealTypes.forEach(type => {
		const foundMeal = mealList.find(meal => meal.mealType === type);
		if (foundMeal) {
			mealListTemplates[type] = createMealTemplate(foundMeal);
		} else {
			mealListTemplates[type] = createEmptyMealTemplate(type);
		}
	});

	return mealListTemplates;
}

function createEntryTemplate(mealTemplates) {
	return `<div class="entries-container">
						${mealTemplates.breakfast}
						${mealTemplates.snack_1}
						${mealTemplates.lunch}
						${mealTemplates.snack_2}
						${mealTemplates.dinner}
						${mealTemplates.snack_3}
					</div>`
}

function createMealTemplate(meal) {
	const foodList = meal.food;
	const entryTime = moment(meal.time).format('hh:mm A');

	let ranks;
	let numbers = [1, 2, 3, 4, 5];
	ranks = numbers.map(num => {
		if (num === meal.rank) {
			return num += 'S';
		} else {
			return num;
		}
	});

	const dishes = `
	<div class="${meal.mealType}-table table">
		<div class="table-row">
			<div class="dish-row header-row">dish</div>
			<div class="cal-row header-row">cal</div>
			<div class="serv-row header-row">serv</div>
		</div>
		${foodList.map(food => 
			`<div class="table-row food-items">
					<div class="dish-input dish-row item">${food.dish}</div>
					<div class="calories-input cal-row item">${food.calories}</div>
					<div class="servings-input serv-row item">${food.servings}</div>
			</div>`).join("")}
	</div>`

	const ranking = `
		<h4>This meal's ranking</h4>
		<ul class="ranking">
			 ${ranks.map((rank) => `
  				<li><img src="../images/smilie-${rank}.svg" class="smilie-${rank}"></li>
				`).join('')}
		</ul>`

	const notes = `
		<h4>Notes:</h4>
		<p>${meal.notes ? `${meal.notes}` : 'No notes'}</p>`
	
	const time = `
		<h3>${entryTime}</h3>`

	const template = 
		`<div class="meal-container ${meal.mealType}-container">
			<div class="delete-message"></div>
			<button class="delete-btn" id="${meal.mealType}-delete">X</button>
			<h2 class="${meal.mealType}" id="${meal._id}">${meal.mealName}</h2>
			<div class="meal-content">
				<div class="meal-left">
					${dishes}
					${ranking}
					${notes}
				</div>			
				<div class="meal-right">
					<div>
						${time}
						<img src="../images/meal-${meal.mealName}.svg" class="meal-img">
						<input type="button" value="Edit" class="edit-meal">
					</div>
				</div>
			</div>
		</div>`
	return template;
}

function createEmptyMealTemplate(type) {
	let mealName;
	if (type === 'snack_1') {
		mealName = 'morning snack';
	} else if (type === 'snack_2') {
		mealName = 'afternoon snack';
	} else if (type === 'snack_3') {
		mealName = 'evening snack';
	} else {
		mealName = type;
	}
	return `
		<div class="meal-container ${type}-container empty">
			<img src="../images/meal-${mealName}.svg" class="meal-empty-img">
			<h2 class="${type}">${mealName}</h2>
			<input type="button" value="+" class="add-meal">
		</div>`
}

function createAllMealsTemplate() {
	return `
	<div class="entries-container">
		<div class="meal-container breakfast-container empty">
			<img src="../images/meal-breakfast.svg" class="meal-empty-img">
			<h2 class="breakfast">Breakfast</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container snack_1-container empty">
			<img src="../images/meal-morning snack.svg" class="meal-empty-img">
			<h2 class="snack_1">Morning Snack</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container lunch-container empty">
			<img src="../images/meal-lunch.svg" class="meal-empty-img">
			<h2 class="lunch">Lunch</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container snack_2-container empty">
			<img src="../images/meal-afternoon snack.svg" class="meal-empty-img">
			<h2 class="snack_2">Afternoon Snack</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container dinner-container empty">
			<img src="../images/meal-dinner.svg" class="meal-empty-img">
			<h2 class="dinner">Dinner</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container snack_3-container empty">
			<img src="../images/meal-evening snack.svg" class="meal-empty-img">
			<h2 class="snack_3">Evening Snack</h2>
			<input type="button" value="+" class="add-meal">
		</div>
	</div>`
}

//// ADD NEW MEAL /////
function handleAddMeal() {
	$('main').on('click', '.add-meal', (e) => {
		const mealType = $(e.target).siblings('h2').attr('class');
		const mealName = $(e.target).siblings('h2').html();
		displayNewMealForm(mealType, mealName);
	});
}

function displayNewMealForm(mealType, mealName) {
	const mealForm = 	
	`<div class="meal-form-container">
			<div id="${mealType}-table" class="table">
				<div class="table-row">
					<div class="dish-row header-row">dish</div>
					<div class="cal-row header-row">cal</div>
					<div class="serv-row header-row">serv</div>
				</div>
			</div>
			<form class="meal-form">			
				<div class="table-row">
					<div class="dish-row">					
						<input type="text" name="dish" class="form-dish dish-row" placeholder="sandwich">
					</div>
					<div class="cal-row">
						<input type="text" name="calories" class="form-calories cal-row" placeholder="300">
					</div>
					<div class="serv-row">
						<input type="text" name="servings" class="form-servings serv-row" placeholder="1">
					</div>
					<div>
						<input type="submit" value="+" class="add-meal-btn">
					</div>			
				</div>
			</form>
		<div class="meal-form-err"></div>
	</div>`

	const ranks = [1, 2, 3, 4, 5];
	const rankForm = 				
	`<div class="rank-container">
		<h4>How would you rate this meal?</h4>
			<form class="ranking-form" id="${mealType}-rank">
				${ranks.map((rank) => `
					<div class="rank-button">					
					<input type="radio" name="rank" value="${rank}" id="radio-${rank}" class="radio-item">
  				<label class="label-item smilie-${rank}" for="radio-${rank}"><img src="../images/smilie-${rank}.svg"></label>
					</div>
				`).join('')}
			</form>
		<div class="rank-err"></div>
	</div>`

	const notesForm = 
	`<div class="notes-container">
			<h4>Notes:</h4>
			<textarea name="notes" rows="4" cols="50" maxlength=250 id="${mealType}-notes"></textarea>
	</div>`

	const currentTime = moment().format('HH:mm');
	const timeForm = 
	`<div class="time-container">
			<h4>Add Time</h4>
			<form class="time-form">
				<input type="time" name="time" value="${currentTime}" id="form-time-${mealType}">
			</form>
			<div class="time-err"></div>					
			<img src="../images/meal-${mealName}.svg" class="meal-img">
	</div>`

	const template = 
	 `<h2 class="${mealType}">${mealName}</h2>
		<button class="close-meal-btn">X</button>
			<div class="meal-content">
			<div class="form-left">
				${mealForm}
				${rankForm}
				${notesForm}
			</div>
			<div class="form-right">
				${timeForm}
				<button type="submit" class="form-save">Save</button>
			</div>
			</div>`
	$(`.${mealType}-container`).toggleClass('empty');
	$(`.${mealType}-container`).html(template);
}

function handleCloseMeal() {
	$('main').on('click', '.close-meal-btn', (e) => {
		const mealType = $(e.target).siblings('h2').attr('class');
		const mealTemplate = createEmptyMealTemplate(mealType);

		$(`.${mealType}-container`).replaceWith(mealTemplate);
	});
}

function handleAddDish() {
	$('main').on('click', '.add-meal-btn', (e) => {
		e.preventDefault();
		const dishInput = $(e.target).parent().siblings().find('input[name="dish"]').val();
		const caloriesInput = $(e.target).parent().siblings().find('input[name="calories"]').val();
		const servingsInput = $(e.target).parent().siblings().find('input[name="servings"]').val();
		const errorDisplay = $(e.target).closest('.meal-form-container').find('.meal-form-err');
		const mealsDisplay = $(e.target).closest('.meal-form-container').find('.table');

		if (caloriesInput === '' || servingsInput === '' || dishInput === '') {
			errorDisplay.html('<p>All form input must be filled</p>')
		} else if (!$.isNumeric(caloriesInput) || !$.isNumeric(servingsInput)) {
			errorDisplay.html('<p>Calories input and servings input must be numeric</p>')
		} else if ( $.isNumeric(dishInput)) {
			errorDisplay.html('<p>Dish input must contains text</p>')
		} else {
			mealsDisplay.append(`<div class="food-items table-row">
															<div class="dish-input dish-row">${dishInput}</div>
													 		<div class="calories-input cal-row">${caloriesInput}</div>
													 		<div class="servings-input serv-row">${servingsInput}</div>
													 		<div><input type="button" value="x" class="remove-dish-btn"></div>
													 </div>`);
			$('.meal-form')[0].reset();
			errorDisplay.empty();
		}
	});
}

function handleRemoveDish() {
	$('main').on('click', '.remove-dish-btn', (e) => {
		$(e.target).closest('.food-items').remove();
	});
}

function handleMealSave() {
	$('main').on('click', '.form-save', (e) => {
		const entryId = TargetEntry._id;
		const mealType = $(e.target).closest('.meal-container').find('h2').attr('class');
		const mealName = $(e.target).closest('.meal-container').find('h2').html();

		let foodList = [];
		$(`main #${mealType}-table .food-items`).each(function() {
			const dishes = $(this).find('.dish-input').html();
			const calories = $(this).find('.calories-input').html();
			const servings = $(this).find('.servings-input').html();
			foodList.push({dish: dishes, calories: calories, servings: servings});
		})

		const rankInput = $('input[name=rank]:checked', `main #${mealType}-rank`).val();
		const notesInput = $(`main #${mealType}-notes`).val();
		let mealNotes;
		if (notesInput === '') {
			mealNotes = 'No notes';
		} else {
			mealNotes = notesInput;
		}

		const date = TargetEntry.date;
		const timeInput = $(`#form-time-${mealType}`).val();

		if (!$(`main .${mealType}-container .food-items`).length) {
			$(`main .${mealType}-container .meal-form-err`).html('<p>Please add a meal</p>')
		} else if (!rankInput) {
			$(`main .${mealType}-container .rank-err`).html('<p>Please rate this meal</p>');
		} else if (!timeInput) {
			$(`main .${mealType}-container .time-err`).html('<p>Please fill out time</p>')
		} else {
			const mealRank = rankInput;
			const currentTime = moment(timeInput, 'HH:mm A').toISOString();
			const time = date.slice(0, -13).concat(currentTime.slice(-13));
			const	mealTime = moment(time).format('hh:mm A');

			const mealInputs = JSON.stringify({
				mealName: mealName,
				mealType: mealType, 
				time: time,
				food: foodList,
				rank: mealRank,
				notes: mealNotes
			})
			postMealRequest(entryId, mealInputs);
		}
	});
}

function postMealRequest(entryId, mealInputs) {
	$.ajax({
		url: `/api/entries/meals/${entryId}/`,
		type: 'POST',
		data: mealInputs,
		contentType: 'application/json',
		dataType: 'json',
		success: displayMeal,
		error: function(err) {
			console.log(err);
		}
	});
}

function getMealRequest(entryId, mealId) {
	$.ajax({
		url: `/api/entries/meals/${entryId}/${mealId}`,
		type: 'GET',
		contentType: 'application/json',
		dataType: 'json',
		success: displayMeal,
		error: function(err) {
			console.log(err);
		}
	});
}

function displayMeal(meal) {
	const mealTemplate = createMealTemplate(meal);
	const mealType = meal.mealType;
	$(`.${mealType}-container`).replaceWith(mealTemplate);
}


//// EDIT MEAL ////
function handleMealEdit() {
	$('main').on('click', '.edit-meal', (e) => {
		const mealType = $(e.target).closest('.meal-container').find('h2').attr('class');
		const mealId = $(e.target).closest('.meal-container').find('h2').attr('id');
		const mealName = $(e.target).closest('.meal-container').find('h2').html();

		const foodList = [];
		const headers = [];
		$(`.${mealType}-table .header-row`).each(function(index, item) {
		    headers[index] = $(item).html();
		});
		$(`.${mealType}-table .food-items`).has('.item').each(function() {
		    let arrayItem = {};
		    $('.item', $(this)).each(function(index, item) {
		        arrayItem[headers[index]] = $(item).html();
		    });
		    foodList.push(arrayItem);
		});

		let rankInput;
		$(e.target).closest('.meal-container').find('.ranking li img').each((index, item) => {
			let className = $(item).attr('class');
			if (className.slice(-1) === 'S' ) {
				rankInput = parseInt(className.slice(7, -1));
			} 
		})

		const notesInput = $(e.target).closest('.meal-container').find('.meal-left p').html();
		const timeInput =  $(e.target).siblings('h3').html().slice(0, 5);
		displayMealEdit(mealId, mealName, mealType, foodList, rankInput, notesInput, timeInput);
	});
}

function displayMealEdit(mealId, mealName, mealType, foodList, rankInput, notesInput, timeInput) {
	const entryId = TargetEntry._id;
	// const mealId = $(`.${mealType}`).attr("id");
	const mealCopy = $(`.${mealType}-container`).html();
	const mealEditTemplate = makeMealEditTemplate(mealId, mealName, mealType, foodList, rankInput, notesInput, timeInput);

	$(`.${mealType}-container`).html(mealEditTemplate);

	// On close button clicked
	$(`.edit-${mealType}`).on('click', (e) => {
		$(e.target).prop("disabled", true);
		const exitMessage = `<div class="exit-message">
													<p>Save Changes?</p>
													<div>
														<button class="edit-save">yes</button>
														<button class="edit-close">no</button>
													</div>
												</div>`
		$(`.${mealType}-container`).prepend(exitMessage);
		$(`.${mealType}-container .exit-message`).addClass('show');
	});

	// On close
	$(`.${mealType}-container`).on('click', '.edit-close', (e) => {
		$(`.${mealType}-container`).html(mealCopy);
	});

	// On save
	$(`.${mealType}-container`).on('click', '.edit-save', (e) => {
		handleEditSave(mealName, mealType, entryId, mealId);
	});
}

function makeMealEditTemplate(mealId, mealName, mealType, foodList, rankInput, notesInput, timeInput) {
	const foodTable = 
	`${foodList.map(food => 
			`<div class="food-items table-row">
					<div class="dish-input dish-row">${food.dish}</div>
					<div class="calories-input cal-row">${food.cal}</div>
					<div class="servings-input serv-row">${food.serv}</div>
					<div><input type="button" value="x" class="remove-dish-btn"></div>
			</div>`).join("")}`

	const mealForm = 
	`<div class="meal-form-container">
			<div id="${mealType}-table" class="table">
				<div class="table-row">
					<div class="dish-row header-row">dish</div>
					<div class="cal-row header-row">cal</div>
					<div class="serv-row header-row">serv</div>
				</div>
				${foodTable}
			</div>				
			<form class="meal-form">
				<div class="table-row">
					<div class="dish-row">
						<input type="text" name="dish" class="form-dish" placeholder="sandwich">
					</div>
					<div class="cal-row">
						<input type="text" name="calories" class="form-calories" placeholder="300">
					</div>
					<div class="serv-row">					
						<input type="text" name="servings" class="form-servings" placeholder="1">
					</div>
					<div>
						<input type="submit" value="+" class="add-meal-btn">
					</div>
				</div>				
			</form>
		<div class="meal-form-err"></div>
	</div>`

	let ranks = {};
	const numbers = [1, 2, 3, 4, 5];
	numbers.forEach(number => {
		if (number === rankInput) {
			ranks[number] = true;
		} else {
			ranks[number] = false;
		}
	})

	const rankForm = 				
	`<div class="rank-container">
		<h4>How would you rate this meal?</h4>
			<form class="ranking-form" id="${mealType}-rank">
				${Object.keys(ranks).map((rank) => `
					<div class="rank-button">					
					<input type="radio" name="rank" value="${rank}" id="radio-${rank}" class="radio-item" ${ranks[rank] ? 'checked' : ''}>
  				<label class="label-item smilie-${rank}" for="radio-${rank}"><img src="../images/smilie-${rank}.svg"></label>
					</div>
				`).join('')}
			</form>
		<div class="rank-err"></div>
	</div>`

	const notesForm = 
	`<div class="notes-container">
			<h4>Notes:</h4>
			<textarea name="notes" rows="4" cols="50" maxlength=250 id="${mealType}-notes">${notesInput}</textarea>
	</div>`

	const timeForm = 				
	`<div class="time-container">
			<h4>Add Time</h4>
			<form class="time-form">
				<input type="time" name="time" value="${timeInput}" id="form-time-${mealType}">
			</form>
			<div class="time-err"></div>
			<img src="../images/meal-${mealName}.svg" class="meal-img">
	</div>`

	const template = 
	 `<h2 class="${mealType}" id="${mealId}">${mealName}</h2>
		<button class="close-edit-btn edit-${mealType}">X</button>
			<div class="meal-content">
				<div class="form-left">
					${mealForm}
					${rankForm}
					${notesForm}
				</div>
				<div class="form-right">
					${timeForm}
					<button type="submit" class="edit-save">Save</button>
				</div>
			</div>`
	return template;
}

function handleEditSave(mealName, mealType, entryId, mealId) {
	let foodList = [];
	$(`main #${mealType}-table .food-items`).each(function() {
		const dishes = $(this).find('.dish-input').html();
		const calories = $(this).find('.calories-input').html();
		const servings = $(this).find('.servings-input').html();
		foodList.push({dish: dishes, calories: calories, servings: servings});
	})

	const rankInput = $('input[name=rank]:checked', `main #${mealType}-rank`).val();
	const notesInput = $(`main #${mealType}-notes`).val();
	let mealNotes;
	if (notesInput === '') {
		mealNotes = 'No notes';
	} else {
		mealNotes = notesInput;
	}

	const date = TargetEntry.date;
	const timeInput = $(`#form-time-${mealType}`).val();

	if (!$(`main .${mealType}-container .food-items`).length) {
		$(`main .${mealType}-container .exit-message`).remove();
		$(`.edit-${mealType}`).prop("disabled", false);
		$(`main .${mealType}-container .meal-form-err`).html('<p>Please add a meal</p>')
	} else if (!rankInput) {
		$(`main .${mealType}-container .exit-message`).remove();
		$(`.edit-${mealType}`).prop("disabled", false);
		$(`main .${mealType}-container .rank-err`).html('<p>Please rate this meal</p>');
	} else if (!timeInput) {
		$(`main .${mealType}-container .exit-message`).remove();
		$(`.edit-${mealType}`).prop("disabled", false);
		$(`main .${mealType}-container .time-err`).html('<p>Please fill out time</p>')
	} else {
		const mealRank = parseInt(rankInput);
		const currentTime = moment(timeInput, 'HH:mm A').toISOString();
		const time = date.slice(0, -13).concat(currentTime.slice(-13));
		const	mealTime = moment(time).format('hh:mm A');

		const mealInputs = JSON.stringify({
			_id: mealId,
			mealName: mealName,
			mealType: mealType, 
			time: time,
			food: foodList,
			rank: mealRank,
			notes: mealNotes
		})
		putMealRequest(mealInputs, entryId, mealId)
	}
}

function putMealRequest(mealInputs, entryId, mealId) {
	$.ajax({
		url: `/api/entries/meals/${entryId}/${mealId}`,
		type: 'PUT',
		data: mealInputs,
		contentType: 'application/json',
		dataType: 'json',
		success: displayMeal,
		error: function(err) {
			console.log(err);
		}
	});
}

///// DELETE MEAL /////
function handleMealDelete() {
	$('main').on('click', '.delete-btn', (e) => {
		const entryId = TargetEntry._id;
		const mealId = $(e.target).siblings('h2').attr('id');
		const mealType = $(e.target).siblings('h2').attr('class');
		const deleteMessage = `<p>Remove Meal?</p>
														<div>
																<button class="delete-yes">yes</button>
																<button class="delete-no">no</button>
														</div>`
		$(`.${mealType}-container .delete-message`).html(deleteMessage);
		$(`.${mealType}-container .delete-message`).addClass('show-message');							

		$(`.${mealType}-container`).on('click', '.delete-yes', (e) => {
			deleteMealRequest(entryId, mealId, mealType);
		});

		$(`.${mealType}-container`).on('click', '.delete-no',(e) => {
			$(`.${mealType}-container .delete-message`).html('');
			$(`.${mealType}-container .delete-message`).removeClass('show-message');	
		});
	});
}

function deleteMealRequest(entryId, mealId, mealType) {
	$.ajax({
		url: `/api/entries/meals/${entryId}/${mealId}`,
		type: 'DELETE',
		contentType: 'application/json',
		dataType: 'json',
		success: displayEmptyMeal(mealType),
		error: function(err) {
			console.log(err);
		}
	});
}

function displayEmptyMeal(mealType) {
	const mealTemplate = createEmptyMealTemplate(mealType);
	$(`.${mealType}-container`).replaceWith(mealTemplate);
}

$(init)