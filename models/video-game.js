const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoGameSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	imageUrl: {
		type: String,
		required: true
	},
	reviews: [{
		type: Schema.Types.ObjectId,
		ref: 'Review'
	}]
}, { timestamps: true });

module.exports = mongoose.model('VideoGame', videoGameSchema);
