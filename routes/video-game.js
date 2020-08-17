const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const videoGameCtrl = require('../controllers/video-game');
const isAuth = require('../middleware/is-auth');

router.get('/video-games', videoGameCtrl.getVideoGames);

router.get('/video-games/:videoGameId/reviews', videoGameCtrl.getVideoGameReviews);

router.post('/video-games', isAuth, [
	body('title')
		.trim()
		.isLength({ min: 5 }),
	body('imageUrl')
		.trim()
		.isLength({ min: 10 })
], videoGameCtrl.createVideoGame);

router.put('/video-games/:videoGameId', isAuth, [
	body('title')
		.trim()
		.isLength({ min: 5 }),
	body('imageUrl')
		.trim()
		.isLength({ min: 10 })
], videoGameCtrl.updateVideoGame);

module.exports = router;
