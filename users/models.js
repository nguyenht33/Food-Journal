const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
	username: String,
	password: String,
	email: String,
	firstname: String,
	lastname: String
})

const User = mongoose.model('User', UserSchema);

module.exports = { User };

