'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Entry } = require('./models');
const { User } = require('../users/models');

//ENTRIES
// router.post('/', jsonParser, (req, res) => {
// 	let { date, water, green, weight, total_calories, avg_rank } = req.body;

// 	Entry
// 		.create({date, water, green, weight, total_calories, avg_rank})
// 		.then(entry => res.status(201).json(entry.serialize()))
// 		.catch(err => {
// 			console.err(err);
// 			res.status(500).json({ message: 'Internal server error'});
// 		});
// });

router.post('/:userId', jsonParser, (req, res) => {
	let { date, water, green, meal_list, weight, total_calories, avg_rank} = req.body;

	const newEntry = new Entry({
		date: date,
		water: water,
		green: green,
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
		.catch(err => res.status(500).send(err));
});

// router.get('/', jsonParser, (req, res) => {
// 	Entry
// 	.find()
// 		.limit(7)
// 		.then(entries => {
// 			res.status(200).json({
// 				entries: entries.map(
// 					(entry) => entry)
// 			});
// 		})
// 		.catch(err => {
// 			console.error(err);
// 			res.status(500).json({ message: 'Internal server error' });
// 		});
// });

router.get('/:entryId', jsonParser, (req, res) => {
	Entry
		.findOne({_id: req.params.entryId})
		.then(entry => {
			res.status(200).json(entry.serialize());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error'});
		});
});

router.put('/:entryId', jsonParser, (req, res) => {
	Entry
		.findOneAndUpdate({_id: req.params.entryId}, req.body)
		.then(entry => res.status(204).send('Entry updated'))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

router.delete('/:entryId', jsonParser, (req, res) => {
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

//MEALS
router.post('/:entryId', jsonParser, (req, res) => {
	let {meal, time, food, rank, note} = req.body;

	Entry
		.findOne({_id: req.params.entryId})
		.then(entry => {
			entry.meal_list.push({ meal, time, food, rank, note });
			return entry.save();
		})
		.then(entry => res.status(201).json({entry}))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

router.put('/:entryId/:meal', jsonParser, (req, res) => {
	let {meal, time, food, rank, note} = req.body;

	Entry
		.findByIdAndUpdate(
			{'_id': req.params.entryId, 'meal_list': req.body },
			{'$set': {'meal_list': { meal: meal, food: food, rank: rank, note: note }}
		})
		.then(entry => {
			res.status(204).send('Meal added');
		})
		.catch(err => {
			res.status(500).json({ message: 'Internal server error' });
		});
})

router.delete('/:entryId/:meal', jsonParser, (req, res) => {
	Entry
		.findByIdAndUpdate(
			{'_id': req.params.entryId}, 
			{'$pull': {'meal_list': { meal: req.params.meal }}
		})
		.then(entry => {
			console.log(entry);
			res.status(204).send('Meal entry deleted');
		})
		.catch(err => {
			res.status(500).json({ message: 'Internal server error' });
		});
});

module.exports = {router};