const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

before(function() {
	console.log('Server starting', TEST_DATABASE_URL);
	return runServer(TEST_DATABASE_URL);
});

beforeEach(done => {
	const { users } = mongoose.connection.collections;
	// console.log('Users dropped');
	users.drop(() => {
		done();
	});
});

beforeEach(done => {
	const { entries } = mongoose.connection.collections;
	entries.drop(() => {
		// console.log('Entries dropped');
		done();
	});
});

after(function() {
	return closeServer();
});