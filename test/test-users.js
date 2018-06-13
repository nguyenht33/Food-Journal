// 'use strict';
// const chai = require('chai');
// const expect = chai.expect;
// const request = require('supertest');
// const assert = require('assert');
// const mongoose = require('mongoose');
// mongoose.Promise = global.Promise;

// const { app } = require('../server');
// const { User } = require('../users');
// const	{ runServer, closeServer } = require('../server');
// const	{ TEST_DATABASE_URL } = require('../config');

// describe('Users Unit Tests', () => {
// 	let joe;

// 	before(function() {
// 		return runServer(TEST_DATABASE_URL);
// 	});

// 	beforeEach(() => {
// 		joe = new User({
// 			username: 'joe',
// 			email: 'joe@schmoe.com',
// 			password: 'schmoe',
// 			firstname: 'joe',
// 			lastname: 'schmoe'
// 		});
// 	});

// 	after(function() {
//     return closeServer();
//   });


// 	it ('Should create a new user', (done) => {
// 		joe.save()
// 			.then(user => {
// 				assert(user._id);
// 				done();
// 			})
// 			.catch(err => {
// 				console.log(err);
// 			}); 
// 	});

// 	it ('Should be able to get a user', (done) => {
// 		joe.save()
// 			.then(_joe => {
// 				User.find({username: 'joe'})
// 					.then(users => {
// 						assert(users[0]._id.toString() === _joe._id.toString());
// 						done();
// 					})
// 					.catch(err => {
// 						return Promise.reject(err)
// 					})
// 			})
// 			.catch(err => {
// 				console.log(err);
// 			});
// 	});
// });


// // describe('POST /api/users', () => {
// // 	it ('Should be able to create a new user', (done) => {
// // 		const jane = {
// // 			username: 'jane',
// // 			email: 'jane@gmail.com',
// // 			password: 'password',
// // 			firstname: 'jane',
// // 			lastname: 'doe'
// // 		}
// // 		request(app)
// // 			.post('/api/users')
// // 			.send(jane)
// // 			.expect(201)
// // 			.expect((res) => {
// // 				expect(res.body.username).to.equal(jane.username);
// // 				expect(res.body.password).to.not.equal(jane.password);
// // 			})
// // 			.end((err, res) => {
// // 				if (err) {
// // 					return done(err);
// // 				}

// // 				User.findById(res.body.id)
// // 					.then(user => {
// // 						expect(user.username).to.equal('jane');
// // 						done();
// // 					})
// // 					.catch(err => done(err));
// // 			});
// // 	});
// // });

// // describe('Users Intergration Test With JWT', () => {
// // 	let authToken;
// // 	const username = 'joe',
// // 				email = 'joe@schmoe.com',
// // 				password = 'password',
// // 				firstname = 'joe',
// // 				lastname = 'doe';

// // 	beforeEach((done) => {
// // 		User.hashPassword(password)
// // 			.then(password => {
// // 				User.create({
// // 					username,
// // 					email,
// // 					password,
// // 					firstname,
// // 					lastname
// // 				});
// // 			})
// // 			.then(user => {
// // 				request(app)
// // 					.post('/api/auth/login')
// // 					.send({ username, password })
// // 					.end((err, res) => {
// // 						authToken = res.headers['set-cookie'].pop().split(';')[0].slice(10);
// // 						done();
// // 					});
// // 			})
// // 			.catch(err => console.log(err));
// // 	});

// // 	describe('PUT /api/users/:userId', () => {
// // 		it ('Should update user by id', (done) => {
// // 			const updatedUser = {
// // 				username: 'john',
// // 				email: 'john@gmail.com',
// // 				password: 'password',
// // 				firstname: 'john',
// // 				lastname: 'smith'
// // 			}
// // 			User.findOne()
// // 				.then(user => {
// // 					request(app)
// // 						.put(`/api/users/${user.id}`)
// // 						.set('Cookie', [`authToken=${authToken}`])
// // 						.send(updatedUser)
// // 						.expect(204)
// // 						.end((err, res) => {
// // 							if (err) {
// // 								return done(err);
// // 							}

// // 							User.findById(user.id)
// // 								.then(user => {
// // 									expect(user.username).to.equal('john');
// // 									done();
// // 								})
// // 								.catch(err => done(err));
// // 						});
// // 				});
// // 		});
// // 	});

// // 	describe('DELETE /api/users/:userId', () => {
// // 		it('Should delete user by id', (done) => {
// // 			let user;

// // 			User.findOne()
// // 				.then(_user => {
// // 					user = _user;
// // 					request(app)
// // 						.delete(`/api/users/${user.id}`)
// // 						.set('Cookie', [`authToken=${authToken}`])
// // 						.expect(204)
// // 						.end((err, res) => {
// // 							if(err) {
// // 								return done(err);
// // 							}
							
// // 							User.findById(user.id)
// // 								.then(user => {
// // 									expect(user).to.be.null;
// // 									done();
// // 								})
// // 								.catch(err => done(err));
// // 						});
// // 				});
// // 		});
// // 	});

// // });



