// const mongoose = require('mongoose');
// mongoose.Promise = global.Promise;

// const { runServer, closeServer } = require('../server');
// const { TEST_DATABASE_URL } = require('../config');
// const { users } = mongoose.connection.collections;
// const { entries } = mongoose.connection.collections;

// before(function() {
// 	return runServer(TEST_DATABASE_URL);
// });

// beforeEach(done => {
// 	// users.drop(() => {
// 	// 	done();
// 	// });
// 	users.drop();
// 	entries.drop();
// 	done();
// });



// // afterEach(done => {
// // 	entries.drop(() => {
// // 		done();
// // 	});
// // })

// // beforeEach(done => {
// // 	entries.drop(() => {
// // 		done();
// // 	});
// // });

// after(function() {
// 	users.drop(() => {
// 		done();
// 	});
// 	entries.drop(() => {
// 		done();
// 	});
// 	return closeServer();
// });