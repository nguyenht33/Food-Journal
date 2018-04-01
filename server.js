'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { User } = require('./users/models');

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/api/users', function(req, res) {

	const {username, password, email, firstname, lastname} = req.body;

	User.find({ username })
		.then(users => {
			if(users.length) {
				return Promise.reject({
					code: 422,
					reason: 'validation error', 
					message: 'username already taken',
					location: 'username'
				});
			};
			return Promise.resolve({});
		})
		.then(() => {
			return User.create({username, password, email, firstname, lastname});			
		})
		.then(user => res.status(201).json(user))
		.catch(err => {
			console.log(err);
			if(err.reason === 'validation error'){
				return res.status(err.code).json(err);
			} 
			res.status(500).json({code:500, message: 'internal error'})
		});
})

let server;

function runServer(databaseUrl, port) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

      server = app.listen(port, () => {
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
  runServer('mongodb://localhost/food-journal', 8080).catch(err => console.error(err));
};

// if (require.main === module) {
//   app.listen(process.env.PORT || 8080, function () {
//     console.info(`App listening on ${this.address().port}`);
//   });
// }

module.exports = app;