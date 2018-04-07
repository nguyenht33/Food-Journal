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
			date: Date.now(),
			water: 2,
			green: 4,
			weight: 155,
			total_calories: 1800,
			avg_rank: 4
		});

		joe.entries.push(breakfast);
		Promise.all([joe.save(), breakfast.save()])
			.then(() => done());
	});

	it.only ('Should save a relation between a user and an entry', (done) => {
		User.findOne({username: 'joe'})
			.populate('entries')
			.then(user => {
				console.log(user);
				assert(user.entries[0].water === 2);
				done();
			});
	});
});
