const { app } = require('../../server');
const { User } = require('../../users');
const { Entry } = require('../../entries');
const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
let authToken;
let testUser;
let userId = mongoose.Types.ObjectId();

const makeUser = (done) => {
	  User.hashPassword('password').then((hash) => {
  		return testUser = User.create({
  			_id: userId,
				email:'joe@schmoe.com',
				password: hash,
				username: 'userjoe',
				firstname:'joe',
				lastname:'doe'
  		})
  	})
}

const populateUser = (done) => {
  User.remove({}).then(() => {
  	return makeUser();
  }).then(() => done());
};

const	testEntries = [{ 
	date: "2018-05-24T04:00:00.000Z",
	weight: "140",
	total_calories: "2400",
	avg_rank: "4",
	meal_list: [{
		mealType: "breakfast",
		mealName: "breakfast",
		time: "2018-05-24T04:00:00.000Z",
		food: [{ name: "cereal", calories: "300", serving: "1" }],
		rank: "3",
		note: "kinda meh"
	}],
	user: userId
}, {
	date: "2018-05-26T04:00:00.000Z",
	weight: "150",
	total_calories: "1400",
	avg_rank: "3",
	meal_list: [{
		mealType: "dinner",
		mealName: "dinner",
		time: "2018-05-26T04:00:00.000Z",
		food: [{ name: "steak", calories: "500", serving: "1" }],
		rank: "5",
		note: "good"
	}],
	user: userId
}];

const populateEntry = (done) => {
  Entry.remove({}).then(() => {
    return Entry.insertMany(testEntries);
  }).then(() => done());
};

const populateUserEntry = (done) => {
	User.findOne().then(_user => {
		Entry.find().then(_entries => {
			_entries.forEach(_entry => {
				_user.entries.push(_entry);
			})
			return _user.save();
		})
		return Promise.resolve();
	}).then(() => done());
};

// const loginUser = (done) => {
// 	User.findOne().then(_user => {
// 		request(app)
// 			.post('/api/auth/login')
// 			.send({ username: 'userjoe', password: 'password' })
// 			.expect(200)
// 			.end((err, res) => {
// 				if (err) {
// 					return done(err);
// 				}
// 				authToken = res.headers['set-cookie'].pop().split(';')[0].slice(10);
// 				console.log(authToken);
// 				done();
// 			});
// 	});
// }



module.exports = {populateUser, populateEntry, populateUserEntry};
