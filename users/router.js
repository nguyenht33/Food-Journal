'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('./models');

const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res) => {
	//missing fields
	const requiredFields = ['username', 'password'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Missing field',
			location: missingField
		});
	}

	//nonstring fields
	const stringFields = ['username', 'password', 'firstname', 'lastname'];
	const nonStringField = stringFields.find(
		field => field in req.body && typeof req.body[field] !== 'string'
	);

	if (nonStringField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Incorrect field type: expected string',
			location: nonStringField
		});
	}

	//trimmed fields
	const requiredTrimFields = ['username', 'password'];
	const nonTrimmedField = requiredTrimFields.find(
		field => req.body[field].trim() !== req.body[field]
	);

	if (nonTrimmedField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Cannot start or end with whitespace',
			location: nonTrimmedField
		});
	}

	//length of field
	const sizedFields = {
		username: {
			min: 1
		},
		password: {
			min: 6,
			max: 72
		}
	}
	const tooSmallField = Object.keys(sizedFields).find(
		field => 
			'min' in sizedFields[field] && 
						req.body[field].trim().length < sizedFields[field].min
	);
	const tooLargeField = Object.keys(sizedFields).find(
		field => 
			'max' in sizedFields[field] &&
						req.body[field].trim().length > sizedFields[field].max
	);

	if (tooSmallField || tooLargeField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: tooSmallField
				? `Must be at least ${sizedFields[tooSmallField].min} characters long`
				: `Must be at most ${sizedFields[tooLargeField].max} characters long`,
			location: tooSmallField || tooLargeField
		});
	}

	const {username, password, firstname = '', lastname = ''} = req.body;
	firstname = firstname.trim();
	lastname = lastname.trim();

	User.find({username})
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
			if(err.reason === 'Validation Error'){
				return res.status(err.code).json(err);
			} 
			res.status(500).json({code:500, message: 'Internal server error'})
		});
})

module.exports = {router};