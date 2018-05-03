'use strict';

const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const passport = require('passport');

const { router: appRouter } = require('./routes');
const { router: usersRouter } = require('./users');
const { router: entriesRouter} = require('./entries');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { PORT, DATABASE_URL } = require('./config');

const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(morgan('common'));

// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
//   if (req.method === 'OPTIONS') {
//     return res.send(204);
//   }
//   next();
// });

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/', appRouter);
app.use('/api/users/', usersRouter);
app.use('/api/entries/', entriesRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

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