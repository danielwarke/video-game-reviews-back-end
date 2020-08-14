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
