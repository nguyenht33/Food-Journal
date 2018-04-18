'use strict';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const assert = require('assert');

const { app } = require('../server');
const { User } = require('../users');
const { Entry } = require('../entries');

describe('Associations', () => {
	let joe;
	let breakfast;

	beforeEach((done) => {
		joe = new User({
			username: 'joe',
			password: 'password',
			firstname: 'joe',
			lastname: 'schmoe'
		});

		breakfast = new Entry({
			date: '2018-04-10 19:24:04.732Z',
			weight: 155,
			total_calories: 1800,
			avg_rank: 4,
			user: joe
		});

		joe.entries.push(breakfast);
		Promise.all([joe.save(), breakfast.save()])
			.then(() => done());
	});

	it ('Should save a relation between a user and an entry', (done) => {
		User.findOne({username: 'joe'})
			.populate('entries')
			.then(user => {
				assert(user.entries[0].weight === 155);
				done();
			});
	});

	it ('Should POST entries to a user account', (done) => {
		const dinner = new Entry({
			date: Date.now(),
			weight: 140,
			total_calories: 3000,
			avg_rank: 4,
		})

		User.findOne({username: 'joe'})
			.then(user => {
				request(app)
					.post(`/api/entries/${user.id}`)
					.send(dinner)
					.expect(201)
					.end((err, res) => {
						if (err) {
							return done(err);
						}

						Entry.find({user: res.body.id})
							.then(entry => {
								expect(entry[0].user.toString()).to.equal(res.body.id);
								done();
							})
							.catch(err => done(err))
					});
			});
	});

	it ('Should GET only entries based off user id', (done) => {
		User.findOne({username: 'joe'})
			.then(user => {
				request(app)
					.get(`/api/users/${user.id}`)
					.expect(200)
					.end((err, res) => {
						if (err) {
							return done(err)
						}

						Entry.findOne({user: res.body.id})
							.then(entry => {
								expect(entry.total_calories).to.equal(1800);
								done();
							})
							.catch(err => done(err));						
					});
			});
	});

});


