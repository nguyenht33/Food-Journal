'use strict';
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../users/models');
const { JWT_SECRET } = require('../config');

const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router();
router.use(cookieParser())

const localStrategy = new LocalStrategy((username, password, callback) => {
  let user;
  User.findOne({ username: username })
    .then(_user => {
      user = _user;
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      return callback(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return callback(null, false, err);
      }
      return callback(err, false);
    });
});

const cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies)
    {
      token = req.cookies['authToken'];
    }
    return token;
};

const jwtStrategy = new JwtStrategy(   
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    algorithms: ['HS256']
  },
  (payload, done) => {
    console.log(payload);
    done(null, payload.user);
  }
);


module.exports = { localStrategy, jwtStrategy };
