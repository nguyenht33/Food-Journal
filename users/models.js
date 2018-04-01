'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	email: String,
	firstname: String,
	lastname: String
})

const User = mongoose.model('User', UserSchema);

module.exports = {User};

