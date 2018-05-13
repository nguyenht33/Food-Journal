'use strict';
const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			passport = require('passport'),
			jwtAuth = passport.authenticate('jwt', { session: false }),
			{ User } = require('../users/models'),
			{ Entry } = require('./models');

// Post an entry to user account
router.post('/new/:userId', jsonParser, jwtAuth, (req, res) => {
	console.log(req.body);
	let { date, meal_list, weight, total_calories, avg_rank } = req.body;
	let entry;

	const newEntry = new Entry({
		date: date,
		meal_list: meal_list,
		weight: weight,
		total_calories: total_calories,
		avg_rank: avg_rank,
		user: req.params.userId
	});	

	Entry.findOne({date: newEntry.date})
		.then(_entry => {
			if (_entry) {
				return Promise.reject({
						code: 422,
						reason: 'ValidationError', 
						message: 'Entry for this date already exists',
						location: 'date'
				});
			} else {
				return newEntry.save()
			}
		})
		.then(__entry => {
			entry = __entry;
			return User.findOne({_id: req.params.userId});
		})
		.then(user => {
			user.entries.push(newEntry);
			return user.save();
		})
		.then(user => {
			res.status(201).send(entry);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error'})
		});
});

// Get all entries from user account
router.get('/all/:userId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.find({ user: req.params.userId })
		.limit(40)
		.then(entries => {
			res.status(200).send(entries);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error'});
		});
});

// Get 7 days of entries
router.get('/week/:userId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.find({ user: req.params.userId })
		.limit(7)
		.then(entries => {
			res.status(200).send(entries);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error'});
		});
});

// Get all entries by date query
router.get('/date/:userId', jsonParser, jwtAuth, (req, res) => {
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

// Get an entry by entry id
router.get('/:entryId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.findOne({_id: req.params.entryId})
		.then(entry => {
			res.status(200).send(entry);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error'});
		});
});

router.put('/:entryId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.findOneAndUpdate({_id: req.params.entryId}, req.body)
		.then(entry => res.status(204).send('Entry updated'))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// don't want user to delete entry
// router.delete('/:entryId', jsonParser, jwtAuth, (req, res) => {
// 	Entry
// 		.findOne({_id: req.params.entryId})
// 		.then(entry => {
// 			entry.remove();
// 			entry.save();
// 		})
// 		.then(res.status(204).send('Entry deleted'))
// 		.catch(err => {
// 			console.error(err);
// 			res.status(500).json({ message: 'Internal server error' });
// 		});
// });

// MEALS
router.post('/meals/:entryId', jsonParser, jwtAuth, (req, res) => {
	let { meal, time, food, rank, notes } = req.body;

	Entry
		.findOne({_id: req.params.entryId})
		.then(entry => {
			const foundMeal = entry.meal_list.find(m => m.meal === meal);

			if (foundMeal) {
				return Promise.reject({
						code: 422,
						reason: 'ValidationError', 
						message: 'Meal entry already exists',
						location: 'meal'
					});
			} else {
				entry.meal_list.push({ meal, time, food, rank, notes });
				return entry.save();
			}
		})
		.then(entry => res.status(201).json({ entry }))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// Update a meal entry
router.put('/meals/:entryId/:mealId', jsonParser, jwtAuth, (req, res) => {
	const { meal, time, food, rank, notes } = req.body;

	Entry
		.findOneAndUpdate(
			{'_id': req.params.entryId, 'meal_list._id': req.params.mealId},
			{'$set': {
								'meal_list.$.meal': meal, 
								'meal_list.$.time': time, 
								'meal_list.$.food': food,
								'meal_list.$.rank': rank,
								'meal_list.$.notes': notes
							}
		})
		.then(entry => {
			res.status(204).end();
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

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