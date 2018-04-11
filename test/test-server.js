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
