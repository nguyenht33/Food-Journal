'use strict';
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const router = express.Router();
const { User } = require('../users/models');
const { Entry } = require('../entries/models');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


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
  let user;
  res.cookie('authToken', authToken, { maxAge: 2 * 60 * 60 * 1000 });

  User.findOne({ _id: userId })
    .then(_user => {
      user = _user;
      res.status(200).json({ user: user })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ message: 'Internal server error'});
    });
});

const jwtAuth = passport.authenticate('jwt', {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.cookie('authToken', authToken);
});

module.exports = {router};
