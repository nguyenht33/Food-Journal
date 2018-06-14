'use strict';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

const {app} = require('../server.js');

describe('index page', () => {
  it('should exist', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end(done);
  });
});

describe('signup page', () => {
  it('should exist', (done) => {
    request(app)
      .get('/signup')
      .expect(200)
      .end(done);
  });
});

describe('login page', () => {
  it('should exist', (done) => {
    request(app)
      .get('/login')
      .expect(200)
      .end(done);
  });
});

describe('dashboard page', () => {
  it('should be unauthorized', (done) => {
    request(app)
      .get('/dashboard')
      .expect(401)
      .end(done);
  });
});

describe('entry page', () => {
  it('should be unauthorized', (done) => {
    request(app)
      .get('/entry')
      .expect(401)
      .end(done);
  });
});


