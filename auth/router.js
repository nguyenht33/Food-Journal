'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('../config');
const router = express.Router();
const { User } = require('../users/models');
const cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(bodyParser.urlencoded({
  extended: true
}));
// router.use(bodyParser.json());

const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', {session: false});

// The user provides a username and password to login
router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.serialize());
  const userId = req.user._id;
  res.cookie('authToken', authToken);
  res.cookie('userId', userId);
  res.redirect('/dashboard'); 

  // User
  //   .findOne({_id: userId})
  //   .populate('entries')
  //   .then(user => {
  //     res.status(200).json({ user: user, authToken: authToken })
  //   })
  //   .catch(err => res.send(err));
});

const jwtAuth = passport.authenticate('jwt', {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

module.exports = {router};
