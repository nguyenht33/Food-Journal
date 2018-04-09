'use strict';

const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const morgan = require('morgan');

const { router: usersRouter } = require('./users');
const { router: entriesRouter} = require('./entries');
const { PORT, DATABASE_URL } = require('./config');

app.use(express.static('public'));
// app.use(morgan('common'));
app.use('/api/users/', usersRouter);
app.use('/api/entries/', entriesRouter);

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