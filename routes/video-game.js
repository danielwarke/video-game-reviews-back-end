const express = require('express');

const router = express.Router();

const videoGameCtrl = require('../controllers/video-game');

router.get('/video-games', videoGameCtrl.getVideoGames);

router.get('/video-games/:videoGameId/reviews', videoGameCtrl.getVideoGameReviews);

module.exports = router;
