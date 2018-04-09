const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

before(function() {
	console.log('TEST URL', TEST_DATABASE_URL);
	return runServer(TEST_DATABASE_URL);
});

beforeEach(done => {
	const { users } = mongoose.connection.collections;
	users.drop(() => {
		done();
	});
});

beforeEach(done => {
	const { entries } = mongoose.connection.collections;
	entries.drop(() => {
		done();
	});
});

after(function() {
	return closeServer();
});