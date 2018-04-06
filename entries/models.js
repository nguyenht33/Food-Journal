'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const MealSchema = mongoose.Schema({
	meal: String,
	time: Date,
	food: [
					{name: String, calories: Number, serving: Number }
				],
	rank: Number,
	note: String
})

const EntrySchema = mongoose.Schema({
	date: Date,
	water: Number,
	green: Number,
	meal_list: [MealSchema],
	weight: Number,
	total_calories: Number,
	avg_rank: Number
});

EntrySchema.methods.serialize = function() {
	return {
		id: this._id,
		date: this.date,
		green: this.green,
		meal_list: this.meal_list,
		total_calories: this.total_calories,
		avg_rank: this.avg_rank
	}
};

const Entry = mongoose.model('Entry', EntrySchema);

module.exports = {Entry};

