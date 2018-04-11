'use strict';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const assert = require('assert');

const { app } = require('../server');
const { Entry } = require('../entries');

describe('Entries Unit Test', () => {
	let testEntry;
	beforeEach(() => {
		testEntry = new Entry({
			date: 'March 20, 2018',
			water: '2',
			green: '3',
			weight: '159',
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
						return Promise.reject(err)
					})
			})
			.catch(err => {
				console.log(err);
			});
	});
});

describe('Entries Intergration Test', () => {

	const testEntry = {
		date: "April 1, 2018",
		water: "3",
		green: "1",
		weight: "140",
		total_calories: "2400",
		avg_rank: "4",
		meal_list: [{
			meal: "breakfast",
			time: "April 1, 2018",
			food: [{ name: "cereal", calories: "300", serving: "1" }],
			rank: "3",
			note: "kinda meh"
		}]
	}

	beforeEach((done) => {
		Entry.remove({})
		.then(() => {
			return Entry.insertMany(testEntry);
		})
		.then(() => done())
		.catch(err => console.log(err));
	});

	describe('GET /api/entries/:id', () => {
		it ('Should be able to get an entry by id', (done) => {
			Entry.findOne()
				.then(entry => {
					request(app)
						.get(`/api/entries/${entry.id}`)
						.expect(200)
						.end(done);
				})
				.catch(er => done(err));
		});
	});

	describe('PUT /api/entries/:entryId', () => {
		const updatedEntry = {
			date: "April 1, 2018",
			water: "8",
			green: "6",
			weight: "140",
			total_calories: "4000",
			avg_rank: "5",
			meal_list: [{
				meal: "dinner",
				time: "April 1, 2018",
				food: [{ name: "porkchop", calories: "500", serving: "1" }],
				rank: "4",
				note: "ok"
			}]
		};
		//PUT not showing updated doc
		it ('Should be able to update entry', (done) => {
			Entry.findOne()
				.then(entry => {
					request(app)
						.put(`/api/entries/${entry.id}`)
						.send(updatedEntry)
						.expect(204)
						.end((err, res) => {
							if (err) {
								return done(err)
							}
							// console.log('THIS IS RES.BODY', res.body);
							Entry.findById(res.body.id)
								.then(entry => {
									// console.log(entry);
									done();
								})
								.catch(err => done(err));
						});
				});
		});
	});

	describe('DELETE /api/entries/:entryId', () => {
		it ('Should delete entry by id', (done) => {
			Entry.findOne()
				.then(entry => {
					request(app)
						.delete(`/api/entries/${entry.id}`)
						.expect(204)
						.end((err, res) => {
							if (err) {
								return done(err);
							}

							Entry.findById(res.body.id)
								.then(entry => {
									expect(entry).to.be.null;
									done();
								})
								.catch(err => done(err));
						});
				});
		});
	});

	// describe('POST /:entryId', () => {
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
	// 					.post(`/api/entries/${entry.id}`)
	// 					.send(lunch)
	// 					.expect(201)
	// 					.end((err, res) => {
	// 						if (err) {
	// 							return done(err);
	// 						}

	// 						Entry.findById(res.body.entry._id)
	// 							.then(entry => {
	// 								expect(entry.meal_list[1].food).to.exist;
	// 								done();
	// 							})
	// 							.catch(err => done(err))
	// 					});
	// 			});
	// 	});
	// });

	// describe.skip('DELETE /:id/:meal', () => {
	// 	xit ('Should delete meal from entry', (done) => {
	// 		let meal;

	// 		Entry.findOne()
	// 			.then(entry => {
	// 				// meal = entry.meal_list[0].meal;
	// 				request(app)
	// 					.delete(`/api/entries/${entry.id}/breakfast`)
	// 					.expect(204)
	// 					.end((err, res) => {
	// 						if (err) {
	// 							return done(err)
	// 						}
	// 						Entry.findById(res.body.id)
	// 							.then(entry => {
	// 								expect(entry).to.be.null;
	// 								done();
	// 							})
	// 							.catch(err => done(err))
	// 					});
	// 			});
	// 	});
	// });

});