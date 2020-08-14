const { validationResult } = require('express-validator/check');

const Review = require('../models/review');
const Comment = require('../models/comment');

exports.getReviewComments = async (req, res, next) => {
	const reviewId = req.body.reviewId;
	const currentPage = req.query.page || 1;
	const perPage = 30;
	
	try {
		const totalItems = await Comment.find({ review: reviewId }).countDocuments();
		const comments = await Comment.find({ review: reviewId }).skip((currentPage - 1) * perPage).limit(perPage);
		
		res.status(200).json({
			message: 'Fetched comments successfully.',
			comments: comments,
			totalItems: totalItems
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.createComment = async (req, res, next) => {
	const errors = validationResult(req);
	
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, entered data is incorrect.');
		error.statusCode = 422;
		throw error;
	}
	
	const reviewId = req.body.reviewId;
	const body = req.body.body;
	
	const comment = new Comment({
		body: body,
		review: reviewId,
		creator: req.userId
	});
	
	try {
		const newComment = await comment.save();
		
		const review = await Review.findById(reviewId);
		review.comments.push(comment);
		const updatedReview = await review.save();
		
		res.status(201).json({
			message: 'Comment created successfully.',
			comment: comment,
			creator: {
				_id: user._id,
				username: user.username
			}
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.updateComment = async (req, res, next) => {
	const errors = validationResult(req);
	
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, entered data is incorrect.');
		error.statusCode = 422;
		throw error;
	}
	
	const commentId = req.params.commentId;
	const body = req.body.body;
	
	try {
		const comment = await Comment.findById(commentId);
		
		if (!comment) {
			const error = new Error('Could not find comment.');
			error.statusCode = 404;
			return next(error);
		}
		
		if (comment.creator.toString() !== req.userId) {
			const error = new Error('Not authorized!');
			error.statusCode = 403;
			return next(error);
		}
		
		comment.body = body;
		
		const updatedComment = await comment.save();
		
		res.status(200).json({
			message: 'Your Comment has been updated.',
			comment: updatedComment
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.deleteComment = async (req, res, next) => {
	const commentId = req.params.reviewId;
	
	try {
		const comment = await Comment.findById(commentId);
		
		if (!comment) {
			const error = new Error('Could not find comment.');
			error.statusCode = 404;
			return next(error);
		}
		
		if (comment.creator.toString() !== req.userId) {
			const error = new Error('Not authorized!');
			error.statusCode = 403;
			return next(error);
		}
		
		const deletedComment = await Comment.findByIdAndRemove(commentId);
		
		// Remove comment from review
		const reviewId = comment.review;
		const review = await Review.findById(reviewId);
		review.comments.pull(commentId);
		const updatedReview = await review.save();
		
		res.status(200).json({ message: 'Comment has been deleted.' });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};
