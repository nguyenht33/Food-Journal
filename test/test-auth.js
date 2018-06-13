// 'use strict';
// const chai = require('chai');
// const request = require('supertest');
// const assert = require('assert');
// const jwt = require('jsonwebtoken');

// const { app } = require('../server');
// const { User } = require('../users');
// const { JWT_SECRET } = require('../config');
// const	{ runServer, closeServer } = require('../server');
// const	{ TEST_DATABASE_URL } = require('../config');

// const expect = chai.expect;

// describe('Auth endpoints', () => {
// 	const username = 'janedoe',
// 				email = 'janedoe@gmail.com',
// 				password = 'mypassword',
// 				firstname = 'jane',
// 				lastname = 'doe';

// 	before(function() {
// 		return runServer(TEST_DATABASE_URL);
// 	});

// 	beforeEach(() => {
// 		return User.hashPassword(password).then(password => {
// 			User.create({
// 				username,
// 				email,
// 				password,
// 				firstname,
// 				lastname
// 			})
// 		});
// 	});

// 	afterEach(function() {
//   	return mongoose.connection.dropDatabase();
// 	});

// 	after(function() {
//     return closeServer();
//   });


// 	describe('/api/auth/login', () => {
// 		it('Should reject request with no credentials', (done) => {
// 			request(app)
// 				.post('/api/auth/login')
// 				.expect(400)
// 				.end(done);
// 		});

// 		it('Should reject request with incorrect usernames', (done) => {
// 			request(app)
// 				.post('/api/auth/login')
// 				.send({ username: 'johndoe', password })
// 				.expect(401)
// 				.end(done);
// 		});		

// 		it('Should reject request with incorrect usernames', (done) => {
// 			request(app)
// 				.post('/api/auth/login')
// 				.send({ username, password: 'wrongPassword' })
// 				.expect(401)
// 				.end(done);
// 		});

// 		it('Should return a valid auth token', (done) => {
// 			request(app)
// 				.post('/api/auth/login')
// 				.send({ username, password })
// 				.expect(200)
// 				.end((err, res) => {
// 					if (err) {
// 						return done(err);
// 					}
// 					const token = res.headers['set-cookie'].pop().split(';')[0].slice(10);
// 					const payload = jwt.verify(token, JWT_SECRET, {
// 						algorithm: ['HS256']
// 					});
					
// 					User.findOne({username: 'janedoe'})					
// 						.then(user => {
// 							expect(payload.user.id).to.equal(user._id.toString());
// 							expect(payload.user.username).to.equal(user.username);
// 							done();
// 						})
// 						.catch(err => done(err));
// 				});
// 		});
// 	});

// 	describe('/api/auth/refresh', () => {
// 		it('Should reject request with no credentials', (done) => {
// 			request(app)
// 				.post('/api/auth/login')
// 				.expect(400)
// 				.end(done);
// 		});

// 		it('Should reject requests with an invalid token', (done) => {
// 			const token = jwt.sign(
// 			{
// 				username,
// 				firstname,
// 				lastname
// 			},
// 			'wrongSecret',
// 			{
// 				algorithm: 'HS256',
// 				expiresIn: '7d'
// 			});

// 			request(app)
// 				.post('/api/auth/refresh')
// 				.set('Cookie', [`authToken=${token}`])
// 				.expect(401)
// 				.end(done);
// 		});

// 		it('Should reject requests with an expired token', (done) => {
// 			const token = jwt.sign(
//         {
//           user: {
//             username,
//             firstname,
//             lastname
//           },
//           exp: Math.floor(Date.now() / 1000) - 10
//         },
//         JWT_SECRET,
//         {
//           algorithm: 'HS256',
//           subject: username
//         }
//       );

//       request(app)
//       	.post('/api/auth/refresh')
//       	.set('Cookie', [`authToken=${token}`])
//       	.expect(401)
//       	.end(done);
// 		});
// 	});
// });