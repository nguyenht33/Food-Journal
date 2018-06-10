'use strict';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const assert = require('assert');

const { app } = require('../server');
const { Entry } = require('../entries');
const { User } = require('../users');

describe('Entries Unit Test', () => {
	let testEntry;
	before(() => {
		testEntry = new Entry({
			date: 'March 20, 2018',
			weight: '159'
		});
	});

	it ('Should be able to post an entry', (done) => {
		testEntry.save()
			.then(entry => {
				assert(entry._id);
				done();
			})
			.catch(err => {
				console.log(err);
			}); 
	}); 

	it ('Should be able to get an entry', (done) => {
		testEntry.save()
			.then(_testEntry => {
				Entry.find({weight: '159'})
					.then(entries => {
						assert(entries[0]._id.toString() === _testEntry._id.toString());
						done();
					})
					.catch(err => {
						console.log(err);
					})
			})
			.catch(err => {
				console.log(err);
			});
	});
});

describe('Entries Intergration Test', () => {
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
						authToken = res.headers['set-cookie'].pop().split(';');
						done();
					});
			})
			.catch(err => console.log(err));
	});

	const testEntry = {
		date: "2018-04-01T04:00:00.000Z",
		weight: "140",
		total_calories: "2400",
		avg_rank: "4",
		meal_list: [{
			meal: "breakfast",
			time: "2018-04-01T04:00:00.000Z",
			food: [{ name: "cereal", calories: "300", serving: "1" }],
			rank: "3",
			note: "kinda meh"
		}] 
	};

	beforeEach((done) => {
		Entry.remove({})
			.then(() => {
				return Entry.insertMany(testEntry);
			})
			.then(() => done())
			.catch(err => console.log(err));
	})


	// describe('POST /api/entries/new/:userId', () => {
	// 	it ('Should POST entries to a user account', (done) => {
	// 		const dinner = new Entry({
	// 			date: Date.now(),
	// 			meal_list: [],
	// 			weight: 140,
	// 			total_calories: 3000,
	// 			avg_rank: 4,
	// 		});

	// 	User.findOne()
	// 		.then(user => {
	// 			request(app)
	// 				.post(`/api/entries/new/${user.id}`) 
	// 				.send(dinner)
	// 				.set('Cookie', [`${authToken}`])
	// 				.expect(201)
	// 				.end((err, res) => {
	// 					if (err) {
	// 						return done(err);
	// 					}

	// 					Entry.find({user: res.body.id})
	// 						.then(entry => {
	// 							expect(entry[0].user.toString()).to.equal(res.body.id);
	// 							done();
	// 						})
	// 						.catch(err => done(err))
	// 				});
	// 		});
	// 	});
	// })


	// describe('PUT /api/entries/:entryId', () => {
	// 	const updatedEntry = {
	// 		date: "2018-04-01T04:00:00.000Z",
	// 		weight: "140",
	// 		total_calories: "4000",
	// 		avg_rank: "5",
	// 		meal_list: [{
	// 			meal: "dinner",
	// 			time: "2018-04-01T04:00:00.000Z",
	// 			food: [{ name: "porkchop", calories: "500", serving: "1" }],
	// 			rank: "4",
	// 			note: "ok"
	// 		}],
	// 	};

	// 	it ('Should be able to update entry by entry id', (done) => {
	// 		Entry.findOne()
	// 			.then(entry => {
	// 				request(app)
	// 					.put(`/api/entries/${entry.id}`)
	// 					.set('Cookie', [`authToken=${authToken}`])
	// 					.send(updatedEntry)
	// 					.expect(204)
	// 					.end((err, res) => {
	// 						if (err) {
	// 							return done(err)
	// 						}
	// 						Entry.findById(entry.id)
	// 							.then(entry => {
	// 								expect(entry.total_calories).to.equal(4000);
	// 								expect(entry.meal_list[0].meal).to.equal('dinner');
	// 								done();
	// 							})
	// 							.catch(err => done(err));
	// 					});
	// 			});
	// 	});
	// });

	// describe('DELETE /api/entries/:entryId', () => {
	// 	it ('Should delete entry by id', (done) => {
	// 		Entry.findOne()
	// 			.then(entry => {
	// 				request(app)
	// 					.delete(`/api/entries/${entry.id}`)
	// 					.set('Cookie', [`authToken=${authToken}`])
	// 					.expect(204)
	// 					.end((err, res) => {
	// 						if (err) {
	// 							return done(err);
	// 						}

	// 						Entry.findById(res.body.id)
	// 							.then(entry => {
	// 								expect(entry).to.be.null;
	// 								done();
	// 							})
	// 							.catch(err => done(err));
	// 					});
	// 			}); 
	// 	});
	// });

	// describe('POST /meal/:entryId', () => {
	// 	const lunch = {
	// 		meal: "lunch",
	// 		time: "2017-11-05T08:15:30-05:00",
	// 		food: [
	// 		{ name: "steak", calories: "800", serving: "2" }],
	// 		rank: "5",
	// 		note: "delicious"
	// 	};

	// 	it ('Should post meal to entry', (done) => {
	// 		Entry.findOne()
	// 			.then(entry => {
	// 				request(app)
	// 					.post(`/api/entries/${entry.id}/meals`)
	// 					.set('Cookie', [`authToken=${authToken}`])
	// 					.send(lunch)
	// 					.expect(201)
	// 					.end((err, res) => {
	// 						if (err) {
	// 							return done(err);
	// 						}

	// 						Entry.findById(res.body.entry._id)
	// 							.then(entry => {
	// 								expect(entry.meal_list).to.be.an('array');
	// 								expect(entry.meal_list[1].food).to.be.an('array');
	// 								done();
	// 							})
	// 							.catch(err => done(err));
	// 					});
	// 			});
	// 	});
	// });

	describe ('PUT /:entryId/meals/:mealId', () => {
		it ('Should update meal to entry', (done) => {
			let meal_id,
					snack_1 = {
						meal: "snack_1",
						time: "2017-11-05T08:15:30-05:00",
						food: [{ name: "chips", calories: "200", serving: "1" }],
						rank: "4",
						note: "not bad"
					};

			Entry.findOne()
				.then(entry => {
					meal_id = entry.meal_list[0]._id;
					request(app)
						.put(`/api/entries/${entry.id}/${meal_id}`)
						.set('Cookie', [`authToken=${authToken}`])
						.send(snack_1)
						.expect(204)
						.end((err, res) => {
							if (err) {
								return done(err);
							}

							Entry.findById(entry.id)
								.then(entry => {
									expect(entry.meal_list[0].meal).to.equal('snack_1');
									done();
								})
								.catch(err => done(err));
						});
				});
		});
	});

	describe ('DELETE /:entryId/:mealId', () => {
		it ('Should delete meal from entry', (done) => {
			let meal_id;

			Entry.findOne()
				.then(entry => {
					meal_id = entry.meal_list[0]._id;
					request(app)
						.delete(`/api/entries/meals/${entry.id}/${meal_id}`)
						.set('Cookie', [`${authToken}`])
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