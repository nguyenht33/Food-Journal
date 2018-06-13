'use strict';

const express = require('express'),
      app = express(),
      path = require('path');
      app.use('/public', express.static(path.resolve(__dirname + '/public')));

const mongoose = require('mongoose');
      mongoose.Promise = global.Promise;

const bodyParser = require('body-parser'),
      jsonParser = bodyParser.json(),
      morgan = require('morgan'),
      passport = require('passport'),
      cookieParser = require('cookie-parser');

const { router: appRouter } = require('./routes'),
      { router: usersRouter } = require('./users'),
      { router: entriesRouter} = require('./entries'),
      { router: authRouter, localStrategy, jwtStrategy } = require('./auth'),
      { PORT, DATABASE_URL } = require('./config');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('common'));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/', appRouter);
app.use('/api/users/', usersRouter);
app.use('/api/entries/', entriesRouter);
app.use('/api/auth/', authRouter);

// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
//   if (req.method === 'OPTIONS') {
//     return res.send(204);
//   }
//   next();
// });
// const jwtAuth = passport.authenticate('jwt', { session: false });

let server;

function runServer(DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app
      	.listen(port, () => {
	        console.log(`Your app is listening on port ${port}`);
	        resolve();
	      })
	      .on('error', err => {
	        mongoose.disconnect();
	        reject(err);
	      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };