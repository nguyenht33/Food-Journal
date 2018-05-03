'use strict';
const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			passport = require('passport'),
			jwtAuth = passport.authenticate('jwt', { session: false }),
			{ User } = require('../users/models'),
			{ Entry } = require('../entries/models');

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/signup', (req, res) => {
  res.render('signup');
})

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
})

router.get('/entries', (req, res) => {
  res.render('entry');
})

router.get('/test', (req, res) => {
	console.log(req.cookie(authToken));
})

module.exports = { router };
