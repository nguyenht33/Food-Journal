'use strict';
const mongoose = require('mongoose'),
			Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var MealSchema = Schema({
	mealName: String,
	mealType: String,
	time: Date,
	food: [
					{dish: String, calories: Number, servings: Number, _id: false }
				],
	rank: Number,
	notes: String
});

var EntrySchema = Schema({
	date: Date,
	meal_list: [MealSchema],
	weight: Number,
	total_calories: Number,
	avg_rank: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' }
});

EntrySchema.methods.dateId = function() {
	return {
		id: this._id,
		date: this.date
	};
};

const Entry = mongoose.model('Entry', EntrySchema);

module.exports = {Entry};

