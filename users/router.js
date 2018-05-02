'use strict';
const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			passport = require('passport'),
			jwtAuth = passport.authenticate('jwt', { session: false }),
			{ User } = require('./models'),
			{ Entry } = require('../entries/models');

// register user
router.post('/', jsonParser, (req, res) => {
	let {username, email, password, firstname, lastname} = req.body;

	User
		.find({ $or: [{ username: username }, { email: email }] })
		.then(users => {
			console.log(users);
			if (users.length === 0) {
				return User.hashPassword(password);
			}
			else if (users[0].username === username) {
				return Promise.reject({
					code: 422,
					reason: 'ValidationError', 
					message: 'Username already taken',
					location: 'username'
				});
			}
			else if (users[0].email === email) {
				return Promise.reject({
					code: 422,
					reason: 'ValidationError', 
					message: 'Email already exists',
					location: 'email'
				});
			};		
		})
		.then(hash => {
			return User.create({
				username, 
				email,
				password: hash,
				firstname, 
				lastname
			});			
		})
		.then(user => {
			return res.status(201).send(user.serialize());
		})
		.catch(err => {
			console.log(err);
			if(err.reason === 'ValidationError'){
				return res.status(err.code).json(err);
			} 
			res.status(500).json({code:500, message: 'Internal server error'})
		});
});

// router.get('/:userId', jsonParser, jwtAuth, (req, res) => {
// 	console.log('getting user data');
// 	User
// 		.findOne({_id: req.params.userId})
// 		.populate('entries')
// 		.then(user => {
// 			res.status(200).send(user.serialize());
// 		})
// 		.catch(err => res.send(err));
// });

router.put('/:userId', jsonParser, jwtAuth, (req, res) => {
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

router.delete('/:userId', jwtAuth, (req, res) => {
	User
		.findOne({_id: req.params.userId})
		.then(user => user.remove())
		.then(user => {
			res.status(204).send('User deleted sucessfully');
		})
		.catch(err => res.status(500).send(err));
});

module.exports = {router};