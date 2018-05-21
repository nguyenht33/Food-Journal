let WeeklyEntries;
let TargetEntry;

///// DISPLAY ENTRY //////
function displayTodayEntry(entry) {
	WeeklyEntries['entries'].push(entry);
	TargetEntry = entry;

	console.log(entry);
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

	mealTypes.forEach(meal => {
		const foundMeal = mealList.find(type => type.meal === meal);
		if (foundMeal) {
			mealListTemplates[meal] = createMealTemplate(foundMeal);
		} else {
			mealListTemplates[meal] = createEmptyMealTemplate(meal);
		}
	});

	return mealListTemplates;
}

function createEntryTemplate(mealTemplates) {
	return `
		<div class="entries-container">
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

	let mealType;
	if (meal.meal.indexOf('snack') >= 0) {
		mealType = 'snack';
	} else {
		mealType = meal.meal;
	}

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
		<table class="${meal.meal}-table">
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
		`<div class="meal-container ${meal.meal}-container">
			<h2 class="${meal.meal}">${mealType}</h2>
			<div class="meal-left">
				${dishes}
				${ranking}
				${notes}
			</div>			
			<div class="meal-right">
				${time}
				<input type="button" value="Edit" class="edit-meal">
			</div>
		</div>`

	return template;
}

function createEmptyMealTemplate(meal) {
	let mealType;

	if (meal.indexOf('snack') >= 0) {
		mealType = 'snack';
	} else {
		mealType = meal;
	}
	return `
		<div class="meal-container ${meal}-container">
			<h2 class="${meal}">${mealType}</h2>
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
			<h2 class="snack_1">Snack</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container lunch-container">
			<h2 class="lunch">Lunch</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container snack_2-container">
			<h2 class="snack_2">Snack</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container dinner-container">
			<h2 class="dinner">Dinner</h2>
			<input type="button" value="+" class="add-meal">
		</div>
		<div class="meal-container snack_3-container">
			<h2 class="snack_3">Snack</h2>
			<input type="button" value="+" class="add-meal">
		</div>`
}

///// ADD NEW MEAL ////////
function handleAddMeal() {
	$('main').on('click', '.add-meal', (e) => {
		const meal = $(e.target).siblings('h2').attr('class');
		displayNewMealForm(meal);
	});
}

function displayNewMealForm(meal) {
	let mealType;
	if (meal.indexOf('snack') >= 0) {
		mealType = 'snack';
	} else {
		mealType = meal;
	}

	const mealForm = 
	 `<h2 class="${meal}">${mealType}</h2>
		<button class="close-meal-btn">X</button>
			<div class="form-left">
				<div class="meal-form-container">
					<table id="${meal}-table">
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
				</div>
				<div class="rank-container">
					<h4>How would you rate this meal?</h4>
					<form class="ranking-form" id="${meal}-rank">
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
					</div>
				</form>
				<div class="notes-container">
					<h4>Notes:</h4>
					<textarea name="notes" rows="4" cols="50" maxlength=250 id="${meal}-notes"></textarea>
				</div>
			</div>
			<div class="form-right">
				<div class="time-container">
					<h4>Add Time</h4>
					<form class="time-form">
						<input type="time" name="time" id="form-time-${meal}">
					</form>
				</div>
				<img src="">
				<button type="submit" class="form-save">Save</button>
			</div>`

	$(`.${meal}-container`).html(mealForm);
}

function handleCloseMeal() {
	$('main').on('click', '.close-meal-btn', (e) => {
		const meal = $(e.target).siblings('h2').attr('class');
		const emptyMealTemplate = createEmptyMealTemplate(meal);

		$(`.${meal}-container`).html(emptyMealTemplate);
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
		const mealName = $(e.target).closest('.meal-container').find('h2').attr('class');
		let mealType;
		if (mealName.indexOf('snack') >= 0) {
			mealType = 'snack';
		} else {
			mealType = mealName;
		}

		let foodList = [];
		$(`#${mealName}-table .food-items`).each(function() {
			const dishes = $(this).find('.dish-cell').html();
			const calories = $(this).find('.calories-cell').html();
			const servings = $(this).find('.servings-cell').html();
			foodList.push({dish: dishes, calories: calories, servings: servings});
		})

		const rankInput = $('input[name=rank]:checked', `#${mealName}-rank`).val();
		const notesInput = $(`#${mealName}-notes`).val();
		let mealNotes;
		if (notesInput === '') {
			mealNotes = 'No notes';
		} else {
			mealNotes = notesInput;
		}

		const date = TargetEntry.date;
		const timeInput = $(`#form-time-${mealName}`).val();

		if (!$('.food-items').length) {
			$('.meal-form-err').html('<p>Please add a meal</p>')
		} else if (!rankInput) {
			$('.rank-container').append('<p>Please rate this meal</p>')
		} else if (timeInput === '') {
			$('.time-container').append('<p>Please fill out time</p>')
		} else {
			const mealRank = rankInput;
			const currentTime = moment(timeInput, 'HH:mm A').toISOString();
			const time = date.slice(0, -13).concat(currentTime.slice(-13));
			const	mealTime = moment(time).format('hh:mm A');

			const data = JSON.stringify({
				meal: mealName,
				time: time,
				food: foodList,
				rank: mealRank,
				notes: mealNotes
			})
			postNewMeal(entryId, data);
		}
	});
}

function postNewMeal(entryId, data) {
	$.ajax({
		url: `/api/entries/meals/${entryId}/`,
		type: 'POST',
		data: data,
		contentType: 'application/json',
		dataType: 'json',
		success: displayTodayEntry,
		error: function(err) {
			console.log(err);
		}
	});
}

function handleMealEdit() {
	$('main').on('click', '.edit-meal', (e) => {
		const mealName = $(e.target).closest('.meal-container').find('h2').attr('class');
		let mealType;
		if (mealName.indexOf('snack') >= 0) {
			mealType = 'snack';
		} else {
			mealType = mealName;
		}

		const foodList = [];
		const headers = [];
		$(`.${mealName}-table th`).each(function(index, item) {
		    headers[index] = $(item).html();
		});
		$(`.${mealName}-table tr`).has('td').each(function() {
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
		const timeInput =  $(e.target).siblings('h3').html();

		displayMealEdit(mealName, mealType, foodList, rankInput, notesInput, timeInput);
	});
}

function displayMealEdit(mealName, mealType, foodList, rankInput, notesInput, timeInput) {
	const mealClone = $(`.${mealName}-container`).html();
	const mealEditTemplate = makeMealEditTemplate(mealName, mealType, foodList, rankInput, notesInput, timeInput);

	$(`.${mealName}-container`).html(mealEditTemplate);

	// On close button clicked
	$(`.edit-${mealName}`).on('click', (e) => {
		const exitMessage = `<div class="exit-message">
													<p>Do you want to save changes?</p>
													<button class="edit-save">save</button>
													<button class="edit-close">close</button>
												</div>`
		$(`.${mealName}-container`).prepend(exitMessage);
	});

	// On close
	$(`.${mealName}-container`).on('click', '.edit-close', (e) => {
		$(`.${mealName}-container`).html(mealClone);
	});

	// On save
	$(`.${mealName}-container`).on('click', '.edit-save', (e) => {
		handleMealEditSave(mealName);
	});
}

function handleMealEditSave(mealName) {
	console.log(mealName);
}

function makeMealEditTemplate(mealName, mealType, foodList, rankInput, notesInput, timeInput) {
	const foodTable = `${foodList.map(food => 
											`<tr>
													<td class="dish-cell">${food.dish}</td>
													<td class="calories-cell">${food.calories}</td>
													<td class="servings-cell">${food.servings}</td>
											</tr>`).join("")}`

	const mealForm = 
	 `<h2 class="${mealName}">${mealType}</h2>
		<button class="close-edit-btn edit-${mealName}">X</button>
			<div class="form-left">
				<div class="meal-form-container">
					<table id="${mealName}-table">
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
				</div>
				<div class="rank-container">
					<h4>How would you rate this meal?</h4>
					<form class="ranking-form" id="${mealName}-rank">
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
					</div>
				</form>
				<div class="notes-container">
					<h4>Notes:</h4>
					<textarea name="notes" rows="4" cols="50" maxlength=250 id="${mealName}-notes">${notesInput}</textarea>
				</div>
			</div>
			<div class="form-right">
				<div class="time-container">
					<h4>Add Time</h4>
					<form class="time-form">
						<input type="time" name="time" value="${timeInput}" id="form-time-${mealName}">
					</form>
				</div>
				<img src="">
				<button type="submit" class="form-save edit-save">Save</button>
			</div>`

	return mealForm;
}

///// DISPLAY WEEKDAYS NAV /////
function displayEntriesNav(entries) {
	WeeklyEntries = entries;
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	const today = moment().startOf('day').toISOString();

	if (WeeklyEntries) {
		getWeekDaysList();
		checkForTodaysEntry();
	} else {
		postTodayEntry(userId, today);
	};
}

function getWeekDaysList() {
	const weeklyEntries = WeeklyEntries['entries'];
	const entries = weeklyEntries.map(e => {
		let entry = {};
		let entryList = [];
		let day = moment(e.date).format('dddd');
		let date = moment(e.date).format('MMMM DD, YYYY');

		entry = {day: day, date: date, id: e._id};
		return entry;
	});

	const weekDaysTemplate = getWeekDaysTemplate(entries);
	$('nav').html(weekDaysTemplate);
}

function getWeekDaysTemplate(entries) {
	return `
		<ul class="days-list">
			${entries.map(entry => `<li id="${entry.id}" class="day"><a>${entry.day}</a></li>`).join("")}
		</ul>`;
}

function handleDayClicked() {
	$('nav').on('click', 'a', (e) => {
		console.log($(e.target).parent().attr('id'));
	});
}

//// POST ENTRY FOR TODAY ////
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
		success: displayTodayEntry,
		error: function(err) {
			console.log(err);
		}
	});
}

// check for today's entry
function checkForTodaysEntry() {
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	const todaysDate = moment().startOf('day').toISOString();

	const todaysEntry = WeeklyEntries['entries'].find(e => e.date === todaysDate);
	TargetEntry = todaysEntry;

	if (todaysEntry) {
		checkMealList(todaysEntry);
	} else {
		postTodayEntry(userId, todaysDate);
	}
}

function checkMealList(todaysEntry) {
	const mealList = todaysEntry.meal_list;
	
	if (mealList.length) {
		displayTodayEntry(todaysEntry);
	} else {
		const emptyMealTemplate = createAllMealsTemplate();
		$('main').html(emptyMealTemplate);
	}
}

//// GET ENTRIES FOR 7 DAYS ////
function getWeeklyEntries() {
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
		success: displayEntriesNav,
		error: function(err) {
			console.log(err);
		}
	});
}



function init() {
	getWeeklyEntries();
	handleDayClicked();
	handleAddMeal();
	handleCloseMeal();
	handleAddDish();
	handleRemoveDish();
	handleMealSave();
	handleMealEdit();
}

$(init)