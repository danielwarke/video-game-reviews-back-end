const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const reviewCtrl = require('../controllers/review');
const isAuth = require('../middleware/is-auth');

router.get('/reviews', reviewCtrl.getReviews);

router.get('/user/reviews/:userId', reviewCtrl.getUserReviews);

router.post('/review', isAuth, [
	body('title')
		.trim()
		.isLength({ min: 5 }),
	body('body')
		.trim()
		.isLength({ min: 5 }),
	body('rating')
		.isNumeric()
], reviewCtrl.createReview);

router.get('/review/:reviewId', reviewCtrl.getReview);

router.put('/review/:reviewId', isAuth, [
	body('title')
		.trim()
		.isLength({ min: 5 }),
	body('body')
		.trim()
		.isLength({ min: 5 }),
	body('rating')
		.isNumeric()
], reviewCtrl.updateReview);

router.delete('/review/:reviewId', isAuth, reviewCtrl.deleteReview);

module.exports = router;
