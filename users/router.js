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
				email,
				password: hash,
				firstname, 
				lastname
			});			
		})
		.then(user => {
			return res.status(201).render('dashboard', {user: user.serialize()});
		})
		.catch(err => {
			console.log(err);
			if(err.reason === 'ValidationError'){
				return res.status(err.code).json(err);
			} 
			res.status(500).json({code:500, message: 'Internal server error'})
		});
});

router.get('/:userId', jsonParser, jwtAuth, (req, res) => {
	console.log('getting user data');
	User
		.findOne({_id: req.params.userId})
		.populate('entries')
		.then(user => {
			res.status(200).send(user.serialize())
		})
		.catch(err => res.send(err));
});

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