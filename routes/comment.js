const express = require('express');
const { body } = require('express-validator/check');

const router = express.Router();

const commentCtrl = require('../controllers/comment');
const isAuth = require('../middleware/is-auth');

router.get('/comments', isAuth, commentCtrl.getReviews);

router.post('/comment', isAuth, [
	body('body')
		.trim()
		.isLength({ min: 5 })
], commentCtrl.createComment);

router.put('/comment/:commentId', isAuth, [
	body('body')
		.trim()
		.isLength({ min: 5 })
], commentCtrl.updateComment);

router.delete('/comment/:commentId', isAuth, commentCtrl.deleteComment);

module.exports = router;
