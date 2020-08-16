const { validationResult } = require('express-validator/check');

const Review = require('../models/review');
const Comment = require('../models/comment');
const User = require('../models/user');
const VideoGame = require('../models/video-game');

exports.getReviews = async (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 10;
	
	try {
		const totalItems = await Review.find().countDocuments();
		const reviews = await Review.find().skip((currentPage - 1) * perPage).limit(perPage);
		
		res.status(200).json({
			message: 'Fetched reviews successfully.',
			reviews: reviews,
			totalItems: totalItems
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.getUserReviews = async (req, res, next) => {
	const userId = req.body.userId;
	const currentPage = req.query.page || 1;
	const perPage = 10;
	
	try {
		const totalItems = await Review.find({ creator: userId }).countDocuments();
		const userReviews = await Review.find({ creator: userId }).skip((currentPage - 1) * perPage).limit(perPage);
		
		res.status(200).json({
			message: 'Fetched reviews successfully.',
			reviews: userReviews,
			totalItems: totalItems
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.createReview = async (req, res, next) => {
	const errors = validationResult(req);
	
	try {
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed, entered data is incorrect.');
			error.statusCode = 422;
			throw error;
		}
		
		const videoGameId = req.body.videoGameId;
		const title = req.body.title;
		const body = req.body.body;
		const rating = req.body.rating;
		
		const review = new Review({
			title: title,
			body: body,
			rating: rating,
			creator: req.userId
		});
		
		const newReview = await review.save();
		
		const user = await User.findById(req.userId);
		user.reviews.push(review);
		const updatedUser = await user.save();
		
		const videoGame = await VideoGame.findById(videoGameId);
		videoGame.reviews.push(review);
		const updatedVideoGame = await videoGame.save();
		
		res.status(201).json({
			message: 'Review created successfully.',
			review: review,
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

exports.updateReview = async (req, res, next) => {
	const errors = validationResult(req);
	
	try {
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed, entered data is incorrect.');
			error.statusCode = 422;
			throw error;
		}
		
		const reviewId = req.params.reviewId;
		const title = req.body.title;
		const body = req.body.body;
		const rating = req.body.rating;
		
		const review = await Review.findById(reviewId);
		
		if (!review) {
			const error = new Error('Could not find review.');
			error.statusCode = 404;
			return next(error);
		}
		
		if (review.creator.toString() !== req.userId) {
			const error = new Error('Not authorized!');
			error.statusCode = 403;
			return next(error);
		}
		
		review.title = title;
		review.body = body;
		review.rating = rating;
		
		const updatedReview = await review.save();
		
		res.status(200).json({
			message: 'Your Review has been updated.',
			review: updatedReview
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.getReview = async (req, res, next) => {
	const reviewId = req.params.reviewId;
	
	try {
		const review = await Review.findById(reviewId);
		
		if (!review) {
			const error = new Error('Could not find review.');
			error.statusCode = 404;
			return next(error);
		}
		
		res.status(200).json({ message: 'Review fetched.', review: review });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.deleteReview = async (req, res, next) => {
	const reviewId = req.params.reviewId;
	
	try {
		const review = await Post.findById(reviewId);
		
		if (!review) {
			const error = new Error('Could not find review.');
			error.statusCode = 404;
			return next(error);
		}
		
		if (review.creator.toString() !== req.userId) {
			const error = new Error('Not authorized!');
			error.statusCode = 403;
			return next(error);
		}
		
		const deletedReview = await Review.findByIdAndRemove(reviewId);
		
		// Remove from user reviews
		const user = await User.findById(req.userId);
		user.reviews.pull(reviewId);
		const updatedUser = await user.save();
		
		// Remove from video game reviews
		const videoGameId = review.videoGame;
		const videoGame = await VideoGame.findById(videoGameId);
		videoGame.reviews.pull(reviewId);
		const updatedVideoGame = await videoGame.save();
		
		// Remove comments for review.
		const deletedComments = await Comment.deleteMany({ review: reviewId });
		
		res.status(200).json({ message: 'Review has been deleted.' });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};
