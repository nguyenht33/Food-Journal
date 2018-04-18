'use strict';
const mongoose = require('mongoose'),
			Schema = mongoose.Schema;

mongoose.Promise = global.Promise;


const MealSchema = Schema({
	meal: String,
	time: Date,
	image: String,
	food: [
					{name: String, calories: Number, serving: Number, _id: false }
				],
	rank: Number,
	note: String
});

const EntrySchema = Schema({
	date: Date,
	meal_list: [MealSchema],
	weight: Number,
	total_calories: Number,
	avg_rank: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' }
});

EntrySchema.methods.serialize = function() {
	return {
		id: this._id,
		date: this.date,
		meal_list: this.meal_list,
		total_calories: this.total_calories,
		avg_rank: this.avg_rank,
		user: this.user
	}
};

const Entry = mongoose.model('Entry', EntrySchema);

module.exports = {Entry};

