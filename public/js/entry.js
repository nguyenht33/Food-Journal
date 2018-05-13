let WeeklyEntries;
let TargetEntry;


// main displaying function
// function displayEntry(todaysEntry) {

// 	// display entries nav bar with 7 days data

// 	// display meal entries if it exists

// 	// display daily stats

// 	const entry = todaysEntry;
// 	const breakfastData = compileBreakfastData(entry);
// 	const breakfastTemplate = createBreakfastTemplate(breakfastData);

// 	$('main').html(breakfastTemplate);
// }

function displayTodayEntry(entry) {
	WeeklyEntries['entries'].push(entry);
	// TargetEntry = entry;

	const mealList = entry.meal_list;
	let entryTemplate,
			mealsTemplate;

	if (mealList.length === 0) {
		entryTemplate = createAllMealsTemplate();
	} else {
		mealsTemplate = checkEachMealEntry(mealList);
		entryTemplate = createEntryTemplate(mealsTemplate);
	}

	console.log(entryTemplate);

	$('main').html(entryTemplate);

}

function checkEachMealEntry(mealList) {
	const mealTypes = ['breakfast', 'snack_1', 'lunch', 'snack_2', 'dinner', 'snack_3'];
	const mealListTemplates = {};

	mealTypes.forEach(meal => {
		const foundMeal = mealList.find(type => type.meal === meal);
		if (foundMeal) {
			console.log('found', meal);
			mealListTemplates[meal] = createMealTemplate(foundMeal);
		} else {
			console.log('not found', meal);
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
	const ranks = [];

	for(let i = 1; i <= 5; i++){
		if (i === meal.rank) {
			i += 'S';
			ranks.push(i);
		} else {
			ranks.push(i);
		}
	}

	const dishes = `
		<table>
			<tr>
				<td>Dish</td>
				<td>Calories</td>
				<td>Servings</td>
			</tr>

			${foodList.map(food => 
				`<tr>
						<td>${food.name}</td>
						<td>${food.calories}</td>
						<td>${food.servings}</td>
				</tr>`).join("")}
		</table>`

	const ranking = `
		<p>How would you rate this meal</p>
		<ul class="ranking">
			 ${ranks.map((rank) => `
  				<li><i class="smilie-${rank}"></i></li>
				`).join('')}
		</ul>
	`
	const notes = `
		<p>
			<span>Notes:</span>
			${meal.notes ? `${meal.notes}` : ''}
		</p>
	`
	const time = `
		<h3>
			${entryTime}
		</h3>
	`
	const template = `
		<div class="meal-container">
			<h2>${meal.meal}</h2>
			<div class="meal-left">
				${dishes}
				${ranking}
				${notes}
			</div>			
			<div class="meal-right">
				${time}
				<input type="button" value="Edit" class="edit-meal">
			</div>
		</div>
	`
	return template;
}

function createEmptyMealTemplate(type) {
	let mealType;

	if (type.indexOf('snack') >= 0) {
		mealType = 'snack';
	} else {
		mealType = type;
	}
	return `
		<div class="empty-meal-container ${type}">
			<h2>${mealType}</h2>
			<input type="button" value="+" class="add-entry">
		</div>
	`
}

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
		success: displayTodayEntry,
		error: function(err) {
			console.log(err);
		}
	});
}

// get entries for 7 days
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

//check for today's entry in local storage
function checkForTodaysEntry() {
	const user = JSON.parse(localStorage.getItem('user'));
	const userId = user._id;
	const todaysDate = moment().startOf('day').toISOString();

	const todaysEntry = WeeklyEntries['entries'].find(e => e.date === todaysDate);

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
		</ul>
	`;
}

function createAllMealsTemplate() {
	return `
		<div class="empty-meal">
			<h2>Breakfast</h2>
			<input type="button" value="+" class="add-entry">
		</div>
		<div class="empty-meal">
			<h2>Snack</h2>
			<input type="button" value="+" class="add-entry">
		</div>
		<div class="empty-meal">
			<h2>Lunch</h2>
			<input type="button" value="+" class="add-entry">
		</div>
		<div class="empty-meal">
			<h2>Snack</h2>
			<input type="button" value="+" class="add-entry">
		</div>
		<div class="empty-meal">
			<h2>Dinner</h2>
			<input type="button" value="+" class="add-entry">
		</div>
		<div class="empty-meal">
			<h2>Snack</h2>
			<input type="button" value="+" class="add-entry">
		</div>
	`
}

function handleDayClicked() {
	$('nav').on('click', 'a', (e) => {
		console.log($(e.target).parent().attr('id'));
	});
}

function init() {
	getWeeklyEntries();
	handleDayClicked();
}

$(init)