'use strict';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const assert = require('assert');

const { app } = require('../server');
const { User } = require('../users');

describe('Users Unit Tests', () => {
	let joe;
	beforeEach(() => {
		joe = new User({
			username: 'joe',
			email: 'joe@schmoe.com',
			password: 'schmoe',
			firstname: 'joe',
			lastname: 'schmoe'
		});
	});

	it ('Should create a new user', (done) => {
		joe.save()
			.then(user => {
				assert(user._id);
				done();
			})
			.catch(err => {
				console.log(err);
			}); 
	});

	it ('Should be able to get a user', (done) => {
		joe.save()
			.then(_joe => {
				User.find({username: 'joe'})
					.then(users => {
						assert(users[0]._id.toString() === _joe._id.toString());
						done();
					})
					.catch(err => {
						return Promise.reject(err)
					})
			})
			.catch(err => {
				console.log(err);
			});
	});
});


describe('POST /api/users', () => {
	it ('Should be able to create a new user', (done) => {
		const jane = {
			username: 'jane',
			email: 'jane@gmail.com',
			password: 'password',
			firstname: 'jane',
			lastname: 'doe'
		}
		request(app)
			.post('/api/users')
			.send(jane)
			.expect(201)
			.expect((res) => {
				expect(res.body.username).to.equal(jane.username);
				expect(res.body.password).to.not.equal(jane.password);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				User.findById(res.body.id)
					.then(user => {
						expect(user.username).to.equal('jane');
						done();
					})
					.catch(err => done(err));
			});
	});
});

describe('Users Intergration Test With JWT', () => {
	let authToken;
	const username = 'joe',
				email = 'joe@schmoe.com',
				password = 'password',
				firstname = 'joe',
				lastname = 'doe';

	beforeEach((done) => {
		User.hashPassword(password)
			.then(password => {
				User.create({
					username,
					email,
					password,
					firstname,
					lastname
				});
			})
			.then(user => {
				request(app)
					.post('/api/auth/login')
					.send({ username, password })
					.end((err, res) => {
						authToken = res.body.authToken;
						done();
					});
			})
			.catch(err => console.log(err));
	});

	// describe('GET /api/users', () => {
	// 	it ('Should be able to get user by id', (done) => {
	// 		User.findOne()
	// 			.then(user => {
	// 				request(app)
	// 					.get(`/api/users/${user._id}`)	
	// 					.expect(200)
	// 					.end((err, res) => {
	// 						if(err) {
	// 							return done(err)
	// 						}
	// 						assert(user.id === res.body.id);
	// 						done();
	// 					});	
	// 			});
	// 	});
	// });

	describe('PUT /api/users/:userId', () => {
		it ('Should update user by id', (done) => {
			const updatedUser = {
				username: 'john',
				email: 'john@gmail.com',
				password: 'password',
				firstname: 'john',
				lastname: 'smith'
			}
			User.findOne()
				.then(user => {
					request(app)
						.put(`/api/users/${user.id}`)
						.set('Authorization', 'Bearer ' + authToken)
						.send(updatedUser)
						.expect(204)
						.end((err, res) => {
							if (err) {
								return done(err);
							}

							User.findById(user.id)
								.then(user => {
									expect(user.username).to.equal('john');
									done();
								})
								.catch(err => done(err));
						});
				});
		});
	});

	describe('DELETE /api/users/:userId', () => {
		it('Should delete user by id', (done) => {
			let user;

			User.findOne()
				.then(_user => {
					user = _user;
					request(app)
						.delete(`/api/users/${user.id}`)
						.set('Authorization', 'Bearer ' + authToken)
						.expect(204)
						.end((err, res) => {
							if(err) {
								return done(err);
							}
							
							User.findById(user.id)
								.then(user => {
									expect(user).to.be.null;
									done();
								})
								.catch(err => done(err));
						});
				});
		});
	});

});



