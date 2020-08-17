const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const commentCtrl = require('../controllers/comment');
const isAuth = require('../middleware/is-auth');

router.get('/reviews/:reviewId/comments', commentCtrl.getReviewComments);

router.post('/reviews/:reviewId/comment', isAuth, [
	body('body')
		.trim()
		.isLength({ min: 5 })
], commentCtrl.createComment);

router.put('/reviews/:reviewId/comment/:commentId', isAuth, [
	body('body')
		.trim()
		.isLength({ min: 5 })
], commentCtrl.updateComment);

router.delete('/reviews/:reviewId/comment/:commentId', isAuth, commentCtrl.deleteComment);

module.exports = router;
