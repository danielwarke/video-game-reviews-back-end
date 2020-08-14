const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	body: {
		type: String,
		required: true
	},
	rating: {
		type: Number,
		required: true
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	videoGame: {
		type: Schema.Types.ObjectId,
		ref: 'VideoGame',
		required: true
	},
	comments: [{
		type: Schema.Types.ObjectId,
		ref: 'Comment'
	}]
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
