'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {User} = require('./models');

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

router.get('/:id', (req, res) => {
	User
		.findOne({_id: req.params.id})
		.then(user => {
			res.status(200).send(user);
		})
		.catch(err => res.send(err));
});

router.put('/:id', jsonParser, (req, res) => {
	User
		.hashPassword(req.body.password).then(hash => {
		req.body.password = hash;
		return Promise.resolve();
	})
	.then(() => {
		User.findOneAndUpdate({_id: req.params.id}, req.body)
		.then(user => {
			return res.status(204).send('Entry updated');
		})
	})		
	.catch(err => res.status(500).send(err));
});

router.delete('/:id', (req, res) => {
	User
		.findOne({_id: req.params.id})
		.then(user => user.remove())
		.then(user => {
			res.status(204).send('User deleted sucessfully');
		})
		.catch(err => res.status(500).send(err));
});

module.exports = {router};