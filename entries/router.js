'use strict';
const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			passport = require('passport'),
			jwtAuth = passport.authenticate('jwt', { session: false }),
			{ User } = require('./models'),
			{ Entry } = require('../entries/models');

// Post an entry to user account
router.post('/new/:userId', jsonParser, jwtAuth, (req, res) => {
	let { date, meal_list, weight, total_calories, avg_rank } = req.body;

	const newEntry = new Entry({
		date: date,
		meal_list: meal_list,
		weight: weight,
		total_calories: total_calories,
		avg_rank: avg_rank,
		user: req.params.userId
	});	

	newEntry.save()
		.then(entry => {
			return User.findOne({_id: req.params.userId})
		})
		.then(user => {
			user.entries.push(newEntry);
			return user.save()
		})
		.then(user => {
			res.status(201).send(user.serialize());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error'});
		});
});

// Get all entries from user account
router.get('/:userId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.find({ user: req.params.userId })
		.limit(7)
		.then(entries => {
			res.status(200).render('testEntry', { entries: entries });
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
		.then(entries => {
			console.log(entries);
			res.status(200).send({ entries });
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// Get an entry by id
// router.get('/:entryId', jsonParser, (req, res) => {
// 	Entry
// 		.findOne({_id: req.params.entryId})
// 		.then(entry => {
// 			res.status(200).json(entry.serialize());
// 		})
// 		.catch(err => {
// 			console.error(err);
// 			res.status(500).json({ message: 'Internal server error'});
// 		});
// });

router.put('/:entryId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.findOneAndUpdate({_id: req.params.entryId}, req.body)
		.then(entry => res.status(204).send('Entry updated'))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

router.delete('/:entryId', jsonParser, jwtAuth, (req, res) => {
	Entry
		.findOne({_id: req.params.entryId})
		.then(entry => {
			entry.remove();
			entry.save();
		})
		.then(res.status(204).send('Entry deleted'))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// MEALS
router.post('/:entryId/meals', jsonParser, jwtAuth, (req, res) => {
	let { meal, time, image, food, rank, note } = req.body;

	Entry
		.findOne({_id: req.params.entryId})
		.then(entry => {
			entry.meal_list.push({ meal, time, image, food, rank, note });
			return entry.save();
		})
		.then(entry => res.status(201).json({ entry }))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

// Update a meal entry
router.put('/:entryId/meals/:mealId', jsonParser, jwtAuth, (req, res) => {
	const { meal, time, image, food, rank, note } = req.body;

	Entry
		.findOneAndUpdate(
			{'_id': req.params.entryId, 'meal_list._id': req.params.mealId},
			{'$set': {
								'meal_list.$.meal': meal, 
								'meal_list.$.time': time, 
								'meal_list.$.image': image,
								'meal_list.$.food': food,
								'meal_list.$.rank': rank,
								'meal_list.$.note': note
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

router.delete('/:entryId/meals/:mealId', jsonParser, jwtAuth, (req, res) => {
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