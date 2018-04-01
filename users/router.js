'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res) => {

	const {username, password, email, firstname, lastname} = req.body;

	User.find({ username })
		.then(users => {
			if(users.length) {
				return Promise.reject({
					code: 422,
					reason: 'validation error', 
					message: 'username already taken',
					location: 'username'
				});
			};
			return Promise.resolve({});
		})
		.then(() => {
			return User.create({username, password, email, firstname, lastname});			
		})
		.then(user => res.status(201).json(user))
		.catch(err => {
			console.log(err);
			if(err.reason === 'validation error'){
				return res.status(err.code).json(err);
			} 
			res.status(500).json({code:500, message: 'internal error'})
		});
})

module.exports = {router};