
'use strict';
const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			passport = require('passport'),
			jwtAuth = passport.authenticate('jwt', { session: false }),
			{ User } = require('../users/models'),
			{ Entry } = require('../entries/models'),
			cookieParser = require('cookie-parser'),
			path = require('path');

router.use(cookieParser());

router.get('/', (req, res) => {
  res.sendFile('home.html', { root: path.join(__dirname, '../public/html') });
});

router.get('/signup', (req, res) => {
  res.sendFile('signup.html', { root: path.join(__dirname, '../public/html') });
});

router.get('/login', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname, '../public/html') });
});

router.get('/dashboard', jwtAuth, (req, res) => {
	res.sendFile('dashboard.html', { root: path.join(__dirname, '../public/html') });
});

router.get('/entry', jwtAuth, (req, res) => {
	res.sendFile('entry.html', { root: path.join(__dirname, '../public/html') });
});

module.exports = { router };
