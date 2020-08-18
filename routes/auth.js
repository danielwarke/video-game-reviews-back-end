const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authCtrl = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/signup', [
	body('email')
		.isEmail()
		.withMessage('Please enter a valid email.')
		.custom((value, { req }) => {
			return User.findOne({ email: value }).then(userDoc => {
				if (userDoc) {
					return Promise.reject('Email address already exists.');
				}
			})
		})
		.normalizeEmail(),
	body('password')
		.trim()
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long.'),
	body('username')
		.trim()
		.not()
		.isEmpty()
], authCtrl.signup);

router.post('/login', authCtrl.login);

router.post('/forgot-password', authCtrl.forgotPassword);

router.put('/change-password', isAuth, authCtrl.changePassword);

module.exports = router;
