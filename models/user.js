const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	admin: {
		type: Boolean,
		required: true
	},
	tempPassword: {
		type: Boolean
	},
	reviews: [{
		type: Schema.Types.ObjectId,
		ref: 'Review'
	}]
});

module.exports = mongoose.model('User', userSchema);
