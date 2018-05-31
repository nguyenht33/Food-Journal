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
		url: `/api/entries/date/${userId}/`,
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

function displayPreviousEntries(entries) {
	WeeklyEntries = entries['entries'];

	// diplays first day of week
	const dayOfWeek = entries['entries'][0].date;
	const firstDayOfWeek = moment(dayOfWeek).locale('en-gb').weekday(dayOfWeek).startOf('week').toISOString();
	const targetEntry = entries['entries'].find(e => e.date === firstDayOfWeek);

	if (targetEntry) {
		TargetEntry = targetEntry;
		checkMealList(targetEntry);
	} else {
		postEntry(firstDayOfWeek);
	}
}

//// GET ENTRIES FOR 7 DAYS ////
function getThisWeeksEntries() {
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	const today = moment().startOf('day').toISOString();
	const endDate = today;
	const startDate = moment(today).startOf('week').toISOString();

	$.ajax({
		url: `/api/entries/date/${userId}/`,
		type: 'GET',
		data: {
			startDate: startDate,
			endDate: endDate
		},
		contentType: 'application/json',
		dataType: 'json',
		success: checkThisWeekEntries,
		error: function(err) {
			console.log(err);
		}
	});
}

// check if this week has any entries
function checkThisWeekEntries(entries) {
	WeeklyEntries = entries['entries'];
	const today = moment().startOf('day').toISOString();

	if (entries) {
		checkForTodaysEntry(entries);
	} else {
		postEntry(today);
	};
}

// check for today's entry
function checkForTodaysEntry(entries) {
	const todaysDate = moment().startOf('day').toISOString();
	const todaysEntry = entries['entries'].find(e => e.date === todaysDate);
	TargetEntry = todaysEntry;

	if (todaysEntry) {
		checkMealList(todaysEntry);
	} else {
		postEntry(todaysDate);
	}
}

// check meal then displays meals if entry exists
function checkMealList(entry) {
	const mealList = entry.meal_list;
	
	if (mealList.length) {
		displayEntry(entry);
	} else {
		displayWeekdaysNav();
		const emptyMealTemplate = createAllMealsTemplate();
		$('main').html(emptyMealTemplate);
	}
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
		return entry = {day: day, date: date, iso: e.date, id: e._id};
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

	// remove dates after today
	const weekDays = weekDaysArray.slice(0, latestIndex + 1);

	// show targetdate as button
	const targetDate = weekDays.find(e => e.iso === TargetEntry.date);
	const weekDaysTemplate = getWeekDaysTemplate(weekDays, targetDate);
	$('nav').html(weekDaysTemplate);
}

function getWeekDaysTemplate(weekDays, targetDate) {
	return `
		<button class="dropdown">
			${targetDate.day}
			<span>${targetDate.date}</span>
		</button>
		<ul class="dropdown-content">
			${weekDays.map(entry => `<li ${entry.id ? `id="${entry.id}"` : `id="${entry.iso}"`} class="day"><a>${entry.day}</a></li>`).join("")}
		</ul>`;
}

function handleDropDownClicked() {
	$('nav').on('click', '.dropdown', (e) => {
		$('.dropdown-content').toggleClass('show');
	});
}

function handleDayClicked() {
	$('nav').on('click', 'a', (e) => {
		const entryId = ($(e.target).parent().attr('id'));

		if (entryId.includes(':')) {
			const date = entryId;
			postEntry(date);
		} else {
			getEntry(entryId);
		}
	});
}

function getEntry(entryId) {
	$.ajax({
		url: `/api/entries/${entryId}/`,
		type: 'GET',
		contentType: 'application/json',
		dataType: 'json',
		success: displayEntry,
		error: function(err) {
			console.log(err);
		}
	});
}

function postEntry(date) {
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	$.ajax({
		url: `/api/entries/new/${userId}/`,
		type: 'POST',
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify({ 
						date: date, 
						meal_list: [],
					}),
		success: displayEntry,
		error: function(err) {
			console.log(err);
		}
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
		<table class="${meal.mealType}-table">
			<tr>
				<th>dish</th>
				<th>calories</th>
				<th>servings</th>
			</tr>

			${foodList.map(food => 
				`<tr>
						<td class="dish-cell">${food.dish}</td>
						<td class="calories-cell">${food.calories}</td>
						<td class="servings-cell">${food.servings}</td>
				</tr>`).join("")}
		</table>`

	const ranking = `
		<h4>This meal's ranking</h4>
		<ul class="ranking">
			 ${ranks.map((rank) => `
  				<li><i class="smilie-${rank}"></i></li>
				`).join('')}
		</ul>`

	const notes = `
		<h4>Notes:</h4>
		<p>${meal.notes ? `${meal.notes}` : 'No notes'}</p>`
	
	const time = `
		<h3>${entryTime}</h3>`

	const template = 
		`<div class="meal-container ${meal.mealType}-container">
			<div class="meal-header">
				<h2 class="${meal.mealType}" id="${meal._id}">${meal.mealName}</h2>
				<button class="delete-btn" id="${meal.mealType}-delete">X</button>
			</div>
			<div class="meal-left">
				${dishes}
				${ranking}
				${notes}
			</div>			
			<div class="meal-right">
				${time}
				<input type="button" value="Edit" class="edit-meal">
			</div>
			<div class="delete-message"></div>
		</div>`
	return template;
}

function createEmptyMealTemplate(type) {
	let mealName;
	if (type.indexOf('snack') >= 0) {
		mealName = 'snack';
	} else {
		mealName = type;
	}
	return `
		<div class="meal-container ${type}-container">
			<h2 class="${type}">${mealName}</h2>
			<input type="button" value="+" class="add-meal">
		</div>`
}

function createAllMealsTemplate() {
	return `
		<div class="meal-container breakfast-container">
			<h2 class="breakfast">Breakfast</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container snack_1-container">
			<h2 class="snack_1">Morning Snack</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container lunch-container">
			<h2 class="lunch">Lunch</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container snack_2-container">
			<h2 class="snack_2">Afternoon Snack</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container dinner-container">
			<h2 class="dinner">Dinner</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container snack_3-container">
			<h2 class="snack_3">Evening Snack</h2>
			<input type="button" value="+" class="add-meal">
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
			<table id="${mealType}-table">
				<th>dish</th>
				<th>calories</th>
				<th>servings</th>
			</table>
			<form class="meal-form">
				<input type="text" name="dish" class="form-dish" placeholder="sandwich">
				<input type="text" name="calories" class="form-calories" placeholder="300">
				<input type="text" name="servings" class="form-servings" placeholder="1">
				<input type="submit" value="+" class="add-meal-btn">
			</form>
			<div class="meal-form-err"></div>
	</div>`

	const ranks = [1, 2, 3, 4, 5];
	const rankForm = 				
	`<div class="rank-container">
		<h4>How would you rate this meal?</h4>
			<form class="ranking-form" id="${mealType}-rank">
				${ranks.map((rank) => `
  				<label class="smilie-${rank}">
							<input type="radio" name="rank" value="${rank}">
					</label>
				`).join('')}
			</form>
		<div class="rank-err"></div>
	</div>`

	const notesForm = 
	`<div class="notes-container">
			<h4>Notes:</h4>
			<textarea name="notes" rows="4" cols="50" maxlength=250 id="${mealType}-notes"></textarea>
	</div>`

	const timeForm = 
	`<div class="time-container">
			<h4>Add Time</h4>
			<form class="time-form">
				<input type="time" name="time" id="form-time-${mealType}">
			</form>
			<div class="time-err"></div>
	</div>`

	const template = 
	 `<h2 class="${mealType}">${mealName}</h2>
		<button class="close-meal-btn">X</button>
			<div class="form-left">
				${mealForm}
				${rankForm}
				${notesForm}
			</div>
			<div class="form-right">
				${timeForm}
				<img src="">
				<button type="submit" class="form-save">Save</button>
			</div>`

	$(`.${mealType}-container`).html(template);
}

function handleCloseMeal() {
	$('main').on('click', '.close-meal-btn', (e) => {
		const mealType = $(e.target).siblings('h2').attr('class');
		const emptyMealTemplate = createEmptyMealTemplate(mealType);

		$(`.${mealType}-container`).html(emptyMealTemplate);
	});
}

function handleAddDish() {
	$('main').on('click', '.add-meal-btn', (e) => {
		e.preventDefault();
		const dishInput = $(e.target).parent().find('input[name="dish"]').val();
		const caloriesInput = $(e.target).parent().find('input[name="calories"]').val();
		const servingsInput = $(e.target).parent().find('input[name="servings"]').val();
		const errorDisplay = $(e.target).closest('.meal-form-container').find('.meal-form-err');
		const mealsDisplay = $(e.target).closest('.meal-form-container').find('table');

		if(caloriesInput === '' || servingsInput === '' || dishInput === '') {
			errorDisplay.html('<p>All form input must be filled</p>')
		} else if (!$.isNumeric(caloriesInput) || !$.isNumeric(servingsInput)) {
			errorDisplay.html('<p>Calories input and servings input must be numeric</p>')
		} else if ( $.isNumeric(dishInput)) {
			errorDisplay.html('<p>Dish input must contains text</p>')
		} else {
			mealsDisplay.append(`<tr class="food-items">
															<td class="dish-cell">${dishInput}</td>
													 		<td class="calories-cell">${caloriesInput}</td>
													 		<td class="servings-cell">${servingsInput}</td>
													 		<td><button class="remove-dish-btn">x</button></td>
													 </tr>`);
			$('.meal-form')[0].reset();
			errorDisplay.empty();
		}
	});
}

function handleRemoveDish() {
	$('main').on('click', '.remove-dish-btn', (e) => {
		$(e.target).closest('tr').remove();
	});
}

function handleMealSave() {
	$('main').on('click', '.form-save', (e) => {
		const entryId = TargetEntry._id;
		const mealType = $(e.target).closest('.meal-container').find('h2').attr('class');
		const mealName = $(e.target).closest('.meal-container').find('h2').html();

		let foodList = [];
		$(`main #${mealType}-table .food-items`).each(function() {
			const dishes = $(this).find('.dish-cell').html();
			const calories = $(this).find('.calories-cell').html();
			const servings = $(this).find('.servings-cell').html();
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
	$(`.${mealType}-container`).html(mealTemplate);
}


//// EDIT MEAL ////
function handleMealEdit() {
	$('main').on('click', '.edit-meal', (e) => {
		const mealType = $(e.target).closest('.meal-container').find('h2').attr('class');
		const mealName = $(e.target).closest('.meal-container').find('h2').html();

		const foodList = [];
		const headers = [];
		$(`.${mealType}-table th`).each(function(index, item) {
		    headers[index] = $(item).html();
		});
		$(`.${mealType}-table tr`).has('td').each(function() {
		    let arrayItem = {};
		    $('td', $(this)).each(function(index, item) {
		        arrayItem[headers[index]] = $(item).html();
		    });
		    foodList.push(arrayItem);
		});

		let rankInput;
		$(e.target).closest('.meal-container').find('.ranking li i').each((index, item) => {
			let className = $(item).attr('class');
			if (className.slice(-1) === 'S' ) {
				rankInput = className.slice(7, -1);
			} 
		})

		const notesInput = $(e.target).closest('.meal-container').find('.meal-left p').html();
		const timeInput =  $(e.target).siblings('h3').html().slice(0, 5);

		displayMealEdit(mealName, mealType, foodList, rankInput, notesInput, timeInput);
	});
}

function displayMealEdit(mealName, mealType, foodList, rankInput, notesInput, timeInput) {
	const entryId = TargetEntry._id;
	const mealId = $(`.${mealType}`).attr("id");
	const mealCopy = $(`.${mealType}-container`).html();
	const mealEditTemplate = makeMealEditTemplate(mealName, mealType, foodList, rankInput, notesInput, timeInput);

	$(`.${mealType}-container`).html(mealEditTemplate);

	// On close button clicked
	$(`.edit-${mealType}`).on('click', (e) => {
		$(e.target).prop("disabled", true);
		const exitMessage = `<div class="exit-message">
													<p>Do you want to save changes?</p>
													<button class="edit-save">yes</button>
													<button class="edit-close">no</button>
												</div>`
		$(`.${mealType}-container`).prepend(exitMessage);
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

function handleEditSave(mealName, mealType, entryId, mealId) {
	let foodList = [];
	$(`main #${mealType}-table .food-items`).each(function() {
		const dishes = $(this).find('.dish-cell').html();
		const calories = $(this).find('.calories-cell').html();
		const servings = $(this).find('.servings-cell').html();
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

function makeMealEditTemplate(mealName, mealType, foodList, rankInput, notesInput, timeInput) {
	const foodTable = 
	`${foodList.map(food => 
			`<tr class="food-items">
					<td class="dish-cell">${food.dish}</td>
					<td class="calories-cell">${food.calories}</td>
					<td class="servings-cell">${food.servings}</td>
					<td><button class="remove-dish-btn">x</button></td>
			</tr>`).join("")}`

	const mealForm = 
	`<div class="meal-form-container">
			<table id="${mealType}-table">
				<th>dish</th>
				<th>calories</th>
				<th>servings</th>
				${foodTable}
			</table>
			<form class="meal-form">
				<input type="text" name="dish" class="form-dish" placeholder="sandwich">
				<input type="text" name="calories" class="form-calories" placeholder="300">
				<input type="text" name="servings" class="form-servings" placeholder="1">
				<input type="submit" value="+" class="add-meal-btn">
			</form>
		<div class="meal-form-err"></div>
	</div>`

	const rankForm = 
	`<div class="rank-container">
			<h4>How would you rate this meal?</h4>
			<form class="ranking-form" id="${mealType}-rank">
				<label class="smilie-1">
					<input type="radio" name="rank" value="1">
				</label>
				<label class="smilie-2">
					<input type="radio" name="rank" value="2">
				</label>
				<label class="smilie-3">
					<input type="radio" name="rank" value="3">
				</label>
				<label class="smilie-4">
					<input type="radio" name="rank" value="4">
				</label>
				<label class="smilie-5">
					<input type="radio" name="rank" value="5">
				</label>
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
	</div>`

	const template = 
	 `<h2 class="${mealType}">${mealName}</h2>
		<button class="close-edit-btn edit-${mealType}">X</button>
			<div class="form-left">
				${mealForm}
				${rankForm}
				${notesForm}
			</div>
			<div class="form-right">
				${timeForm}
				<img src="">
				<button type="submit" class="edit-save">Save</button>
			</div>`
	return template;
}

///// DELETE MEAL /////
function handleMealDelete() {
	$('main').on('click', '.delete-btn', (e) => {
		const entryId = TargetEntry._id;
		const mealId = $(e.target).siblings('h2').attr('id');
		const mealType = $(e.target).siblings('h2').attr('class');
		const deleteMessage = `<p>Do you want to remove this meal?</p>
													<button class="delete-yes">yes</button>
													<button class="delete-no">no</button>`
		$(`.${mealType}-container .delete-message`).html(deleteMessage);

		$(`.${mealType}-container`).on('click', '.delete-yes', (e) => {
			deleteMealRequest(entryId, mealId, mealType);
		});

		$(`.${mealType}-container`).on('click', '.delete-no',(e) => {
			$(`.${mealType}-container .delete-message`).html('');
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
	$(`.${mealType}-container`).html(mealTemplate);
}

$(init)