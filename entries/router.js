'use strict';
const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			passport = require('passport'),
			jwtAuth = passport.authenticate('jwt', { session: false }),
			{ User } = require('../users/models'),
			{ Entry } = require('./models');

// Entry //
// Get an entry by date, else make a new entry
router.get('/date/:userId', jsonParser, jwtAuth, (req, res) => {
	let entry;
	let newEntry;

		Entry
		.find({ user: req.params.userId, date: req.query.date })		
		.then(_entry => {
			if (_entry.length) {
				entry = _entry;
				return res.status(200).send(entry[0]);
			} else {
				newEntry = new Entry({ 
					date: req.query.date, 
					meal_list: [],
					user: req.params.userId
				});
				return newEntry.save()
					.then(__entry => {
						return User.findOne({_id: req.params.userId});
					})
					.then(user => {
						user.entries.push(newEntry);
						return user.save();
					})
					.then(user => {
						return res.status(201).send(newEntry);
				})	
			}
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// Get all user's entry and return as dates
router.get('/months/:userId', jsonParser, jwtAuth, (req, res) => {
	let entryDates;
	Entry
		.find({ user: req.params.userId })
		.sort('date')
		.then(entries => {
			entryDates = entries.map(entry => {
				return {date: entry.date};
			}) 
			res.status(200).send(entryDates);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error'});
		});
});

// Get all entries of week using date query
router.get('/week/:userId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.find({ user: req.params.userId, 
						date: { $gte: req.query.startDate, $lte: req.query.endDate } 
		})
		.sort('date')
		.then(entries => {
			res.status(200).send({ entries });
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// Update entry 
router.put('/:entryId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.findOneAndUpdate({_id: req.params.entryId}, req.body)
		.then(entry => res.status(204).send('Entry updated'))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// MEALS //
// Get a meal from an entry
router.get('/meals/:entryId/:mealId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.findOne({'_id': req.params.entryId}, {meal_list: {$elemMatch: {_id: req.params.mealId}}})
		.then(meal => {
			res.status(200).send(meal);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error'});
		});
});

// Post a meal to an entry
router.post('/meals/:entryId', jsonParser, jwtAuth, (req, res) => {
	let { mealName, mealType, time, food, rank, notes } = req.body;

	Entry
		.findOne({_id: req.params.entryId})
		.then(entry => {
			const foundMeal = entry.meal_list.find(m => m.mealType === mealType);

			if (foundMeal) {
				return Promise.reject({
						reason: 'ValidationError', 
						message: 'Meal entry already exists',
						location: 'meal'
					});
			} else {
				entry.meal_list.push({ mealName, mealType, time, food, rank, notes });
				return entry.save();
			}
		})
		.then(entry => {
			res.status(201).send({ mealName, mealType, time, food, rank, notes })
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// Update a meal to entry
router.put('/meals/:entryId/:mealId', jsonParser, jwtAuth, (req, res) => {
	const { _id, mealName, mealType, time, food, rank, notes } = req.body;

	Entry
		.findOneAndUpdate(
			{'_id': req.params.entryId, 'meal_list._id': req.params.mealId},
			{'$set': {
								'meal_list.$.mealName': mealName, 
								'meal_list.$.mealType': mealType, 
								'meal_list.$.time': time, 
								'meal_list.$.food': food,
								'meal_list.$.rank': rank,
								'meal_list.$.notes': notes
							}
		})
		.then(entry => {
			res.status(200).send({ _id, mealName, mealType, time, food, rank, notes });
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// Delete a meal from entry
router.delete('/meals/:entryId/:mealId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.findByIdAndUpdate(
			{'_id': req.params.entryId}, 
			{'$pull': {'meal_list': { '_id': req.params.mealId }}
		})
		.then(entry => {
			res.status(204).end();
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

module.exports = {router};