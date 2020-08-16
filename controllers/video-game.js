const VideoGame = require('../models/video-game');
const Review = require('../models/review');

exports.getVideoGames = async (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 30;
	
	try {
		const totalItems = await VideoGame.find().countDocuments();
		const videoGames = await VideoGame.find().skip((currentPage - 1) * perPage).limit(perPage);
		
		res.status(200).json({
			message: 'Fetched video games successfully.',
			VideoGame: videoGames,
			totalItems: totalItems
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.getVideoGameReviews = async (req, res, next) => {
	const videoGameId = req.body.videoGameId;
	const currentPage = req.query.page || 1;
	const perPage = 10;
	
	try {
		const totalItems = await Review.find({ videoGame: videoGameId }).countDocuments();
		const videoGameReviews = await Review.find({ videoGame: videoGameId }).skip((currentPage - 1) * perPage).limit(perPage);
		
		res.status(200).json({
			message: 'Fetched reviews successfully.',
			reviews: videoGameReviews,
			totalItems: totalItems
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.createVideoGame = async (req, res, next) => {
	const errors = validationResult(req);
	
	try {
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed, entered data is incorrect.');
			error.statusCode = 422;
			throw error;
		}
		
		const title = req.body.title;
		const description = req.body.description;
		const imageUrl = req.body.imageUrl;
		
		const videoGame = new VideoGame({
			title: title,
			description: description,
			creator: req.userId,
			imageUrl: imageUrl
		});
		
		const newVideoGame = await videoGame.save();
		
		res.status(201).json({
			message: 'Video Game created successfully.',
			videoGame: videoGame,
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

exports.updateVideoGame = async (req, res, next) => {
	const errors = validationResult(req);
	
	try {
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed, entered data is incorrect.');
			error.statusCode = 422;
			throw error;
		}
		
		const videoGameId = req.params.videoGameId;
		const title = req.body.title;
		const description = req.body.description;
		const imageUrl = req.body.imageUrl;
		
		const videoGame = await VideoGame.findById(videoGameId);
		
		if (!videoGame) {
			const error = new Error('Could not find video game.');
			error.statusCode = 404;
			return next(error);
		}
		
		if (videoGame.creator.toString() !== req.userId) {
			const error = new Error('Not authorized!');
			error.statusCode = 403;
			return next(error);
		}
		
		videoGame.title = title;
		videoGame.description = description;
		videoGame.imageUrl = imageUrl;
		
		const updatedVideoGame = await videoGame.save();
		
		res.status(200).json({
			message: 'This Video Game has been updated.',
			videoGame: updatedVideoGame
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};
