const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { users } = mongoose.connection.collections;

before(function() {
	console.log('Server starting', TEST_DATABASE_URL);
	return runServer(TEST_DATABASE_URL);
});

beforeEach(done => {
	users.drop(() => {
		done();
	});
});

// afterEach(done => {
// 	const { users } = mongoose.connection.collections;
// 	users.drop(() => {
// 		done();
// 	});
// })

// beforeEach(done => {
// 	const { entries } = mongoose.connection.collections;
// 	entries.drop(() => {
// 		done();
// 	});
// });

after(function() {
	users.drop(() => {
		done();
	});
	return closeServer();
});