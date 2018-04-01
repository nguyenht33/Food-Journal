'use strict';

const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const morgan = require('morgan');

const { router: usersRouter } = require('./users');
const { PORT, DATABASE_URL } = require('./config');

app.use('/api/users/', usersRouter);
app.use(express.static('public'));
app.use(morgan('common'));

let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app
      	.listen(PORT, () => {
	        console.log(`Your app is listening on port ${PORT}`);
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
  runServer().catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };