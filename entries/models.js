'use strict';
const mongoose = require('mongoose'),
			Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const MealSchema = Schema({
	mealName: String,
	mealType: String,
	time: Date,
	food: [
					{dish: String, calories: Number, servings: Number, _id: false }
				],
	rank: Number,
	notes: String
});

const EntrySchema = Schema({
	date: Date,
	meal_list: [MealSchema],
	weight: Number,
	total_calories: Number,
	avg_rank: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Entry = mongoose.model('Entry', EntrySchema);

module.exports = {Entry};

