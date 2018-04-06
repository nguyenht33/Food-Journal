'use strict';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const assert = require('assert');

const { app } = require('../server');
const { Entry } = require('../entries');

// describe('Unit testing', () => {

// 	it ('Should be able to get an entry', (done) => {
		
// 	}); 
// });