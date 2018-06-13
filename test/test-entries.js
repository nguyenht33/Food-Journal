'use strict';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const assert = require('assert');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { users } = mongoose.connection.collections;
const { entries } = mongoose.connection.collections;
const { app } = require('../server');
const { Entry } = require('../entries');
const { User } = require('../users');
const	{ runServer, closeServer } = require('../server');
const	{ TEST_DATABASE_URL } = require('../config');
const { populateUser, populateEntry, populateUserEntry, loginUser } = require('./seed/seed');



// describe('Entries Unit Test', () => {
// 	let testEntry;
// 	before(() => {
// 		testEntry = new Entry({
// 			date: 'March 20, 2018',
// 			weight: '159'
// 		});
// 	});

// 	it ('Should be able to post an entry', (done) => {
// 		testEntry.save()
// 			.then(entry => {
// 				assert(entry._id);
// 				done();
// 			})
// 			.catch(err => {
// 				console.log(err);
// 			}); 
// 	}); 

// 	it ('Should be able to get an entry', (done) => {
// 		testEntry.save()
// 			.then(_testEntry => {
// 				Entry.find({weight: '159'})
// 					.then(entries => {
// 						assert(entries[0]._id.toString() === _testEntry._id.toString());
// 						done();
// 					})
// 					.catch(err => {
// 						console.log(err);
// 					})
// 			})
// 			.catch(err => {
// 				console.log(err);
// 			});
// 	});
// });

describe('Entries Intergration Test', () => {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});
	beforeEach(populateUser);
	beforeEach(populateEntry);
	beforeEach(populateUserEntry);
	afterEach(function() {
  	return users.drop();
	});
	afterEach(function() {
  	return entries.drop();
	});
	after(function() {
	  return closeServer();
	});


	let authToken;
	const loginUser = (done) => {
		User.findOne().then(_user => {
			request(app)
				.post('/api/auth/login')
				.send({ username: 'userjoe', password: 'password' })
				.expect(200)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					authToken = res.headers['set-cookie'].pop().split(';')[0].slice(10);
					done();
				});
		});
	}


	describe('GET /api/entries/date/:userId', () => {
		beforeEach(loginUser);
		const dateQuery = "2018-05-26T04:00:00.000Z";

		it ('Should be able to get an entry from a date', (done) => {
			User.findOne()
				.then(user => {
					request(app)
						.get(`/api/entries/date/${user.id}/`)
						.query({date: dateQuery})
						.set('Cookie', [`authToken=${authToken}`])
						.expect(200)
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							expect(res.body.user).to.equal(user.id);
							done();
						});
				});
		});
	});

	describe('GET /api/entries/months/:userId', () => {
		beforeEach(loginUser);
		it ('Should be able to get all users entries', (done) => {
			User.findOne()
				.then(user => {
					request(app)
						.get(`/api/entries/months/${user.id}`)
						.set('Cookie', [`authToken=${authToken}`])
						.expect(200)
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							expect(res.body).to.be.an('array');
							expect(res.body[0].date).to.equal('2018-05-24T04:00:00.000Z')
							done();
						});
				});
		});
	});

	describe('GET /api/entries/week/:userId', () => {
		beforeEach(loginUser);
		const dateQuery = {
			startDate: "2018-03-29T04:00:00.000Z",
			endDate: "2018-04-01T04:00:00.000Z"
		};
		it ('Should be able to get entries from start date to end date', (done) => {
			User.findOne()
				.then(user => {
					request(app)
						.get(`/api/entries/week/${user.id}`)
						.send(dateQuery)
						.set('Cookie', [`authToken=${authToken}`])
						.expect(200)
						.end((err, res) => {
							if (err) {
								return done(err);
							}
							expect(res.body.entries).to.be.an('array');
							done();
						})
				})
		});
	});

	describe('PUT /api/entries/:entryId', () => {
		beforeEach(loginUser);
		const updatedEntry = {
			date: "2018-04-01T04:00:00.000Z",
			weight: "140",
			total_calories: "4000",
			avg_rank: "5",
			meal_list: [{
				mealType: "dinner",
				mealName: "dinner",
				time: "2018-04-01T04:00:00.000Z",
				food: [{ name: "porkchop", calories: "500", serving: "1" }],
				rank: "4",
				note: "ok"
			}],
		};

		it ('Should be able to update entry by entry id', (done) => {
			Entry.findOne()
				.then(entry => {
					request(app)
						.put(`/api/entries/${entry.id}`)
						.set('Cookie', [`authToken=${authToken}`])
						.send(updatedEntry)
						.expect(204)
						.end((err, res) => {
							if (err) {
								return done(err)
							}
							Entry.findById(entry.id)
								.then(entry => {
									expect(entry.total_calories).to.equal(4000);
									expect(entry.meal_list[0].mealType).to.equal('dinner');
									done();
								})
								.catch(err => done(err));
						});
				});
		});
	});

	describe('POST /meals/:entryId', () => {
		beforeEach(loginUser);
		const lunch = {
			mealType: "lunch",
			mealName: "lunch",
			time: "2017-11-05T08:15:30-05:00",
			food: [
			{ name: "steak", calories: "800", serving: "2" }],
			rank: "5",
			note: "delicious"
		};

		it ('Should post meal to entry', (done) => {
			Entry.findOne()
				.then(entry => {
					request(app)
						.post(`/api/entries/meals/${entry.id}`)
						.set('Cookie', [`authToken=${authToken}`])
						.send(lunch)
						.expect(201)
						.end((err, res) => {
							if (err) {
								return done(err);
							}

							Entry.findById(entry.id)
								.then(entry => {
									expect(entry.meal_list).to.be.an('array');
									expect(entry.meal_list[1].food).to.be.an('array');
									expect(entry.meal_list[1].mealName).to.equal('lunch');
									done();
								})
								.catch(err => done(err));
						});
				});
		});
	});

	describe ('PUT /:entryId/:mealId', () => {
		beforeEach(loginUser);
		it ('Should update meal to entry', (done) => {
			let meal_id,
					breakfast = {
						mealType: "breakfast",
						mealName: "breakfast",
						time: "2017-11-05T08:15:30-05:00",
						food: [{ name: "chips", calories: "200", serving: "1" }],
						rank: "3",
						note: "not bad"
					};

			Entry.findOne()
				.then(entry => {
					meal_id = entry.meal_list[0]._id;
					request(app)
						.put(`/api/entries/meals/${entry.id}/${meal_id}`)
						.set('Cookie', [`authToken=${authToken}`])
						.send(breakfast)
						.expect(200)
						.end((err, res) => {
							if (err) {
								return done(err);
							}

							Entry.findById(entry.id)
								.then(entry => {
									expect(entry.meal_list[0].mealType).to.equal('breakfast');
									expect(entry.meal_list[0].rank).to.equal(3);
									done();
								})
								.catch(err => done(err));
						});
				});
		});
	});

	describe ('DELETE /:entryId/:mealId', () => {
		beforeEach(loginUser);
		it ('Should delete meal from entry', (done) => {
			let meal_id;

			Entry.findOne()
				.then(entry => {
					meal_id = entry.meal_list[0]._id;
					request(app)
						.delete(`/api/entries/meals/${entry.id}/${meal_id}`)
						.set('Cookie', [`authToken=${authToken}`])
						.expect(204)
						.end((err, res) => {
							if (err) {
								return done(err);
							}

							Entry.findById(entry.id)
								.then(entry => {
									expect(entry.meal_list).to.be.empty;
									done();
								})
								.catch(err => done(err));
						});
				});
		});
	});

});