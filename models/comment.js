const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	body: {
		type: String,
		required: true
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	review: {
		type: Schema.Types.ObjectId,
		ref: 'Review',
		required: true
	}
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
