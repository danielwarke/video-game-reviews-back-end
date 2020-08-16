const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
	const errors = validationResult(req);
	
	try {
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		
		const email = req.body.email;
		const username = req.body.username;
		const password = req.body.password;
		
		const hashedPw = await bcrypt.hash(password, 12);
		const user = new User({
			email: email,
			password: hashedPw,
			username: username
		});
		
		const newUser = await user.save();
		res.status(201).json({
			message: 'Your user account has been created. Please Log In.',
			userId: newUser._id
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.login = async (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	
	try {
		const user = await User.findOne({ email: email });
		
		if (!user) {
			const error = new Error('A user with this email address could not be found.');
			error.statusCode = 401;
			return next(error);
		}
		
		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			const error = new Error('Incorrect password. Please try again.');
			error.statusCode = 401;
			return next(error);
		}
		
		const token = jwt.sign({
			email: user.email,
			userId: user._id.toString()
		}, 'videogamesarefun', { expiresIn: '4h' });
		
		res.status(200).json({
			token: token,
			userId: user._id.toString()
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

