'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { User } = require('./models');
const { Entry} = require('../entries/models');

router.post('/', jsonParser, (req, res) => {
	let {username, password, firstname, lastname} = req.body;

	User
		.find({username})
		.then(users => {
			if(users.length) {
				return Promise.reject({
					code: 422,
					reason: 'ValidationError', 
					message: 'Username already taken',
					location: 'username'
				});
			};
			return User.hashPassword(password);
		})
		.then(hash => {
			return User.create({
				username, 
				password: hash,
				firstname, 
				lastname
			});			
		})
		.then(user => {
			return res.status(201).json(user.serialize());
		})
		.catch(err => {
			console.log(err);
			if(err.reason === 'ValidationError'){
				return res.status(err.code).json(err);
			} 
			res.status(500).json({code:500, message: 'Internal server error'})
		});
});

router.get('/:userId', (req, res) => {
	User
		.findOne({_id: req.params.userId})
		.populate('entries')
		.then(user => {
			res.status(200).json(user.serialize());
		})
		.catch(err => res.send(err));
});

router.put('/:userId', jsonParser, (req, res) => {
	User
		.hashPassword(req.body.password).then(hash => {
		req.body.password = hash;
		return Promise.resolve();
	})
	.then(() => {
		User.findOneAndUpdate({_id: req.params.userId}, req.body)
		.then(user => {
			return res.status(204).send('Entry updated');
		})
	})		
	.catch(err => res.status(500).send(err));
});

router.delete('/:userId', (req, res) => {
	User
		.findOne({_id: req.params.userId})
		.then(user => user.remove())
		.then(user => {
			res.status(204).send('User deleted sucessfully');
		})
		.catch(err => res.status(500).send(err));
});

//Get all entries from user
router.get('/:userId/entries', jsonParser, (req, res) => {
	Entry
		.find({ user: req.params.userId })
		.limit(5)
		.then(entries => {
			res.status(200).send({ entries });
		})
		.catch(err => res.status(500).send(err));
})

// /:userId/entries/:entryId
//Get an entry with date query
// router.get('/entries/:userId', jsonParser, (req, res) => {
// 	Entry
// 		.findOne({ user: req.params.userId })
// 		.where('date').equals(req.query.date)
// 		.then(entry => {
// 			res.status(200).send(entry);
// 		})
// 		.catch(err => res.status(500).send(err));
// });

module.exports = {router};