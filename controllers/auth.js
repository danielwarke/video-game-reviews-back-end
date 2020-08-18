const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const passwordGenerator = require('generate-password');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendGridTransport({
	auth: {
		api_key: process.env.SENDGRID_API_KEY
	}
}));

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
			username: username,
			admin: false
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
		}, process.env.TOKEN_SECRET, { expiresIn: '4h' });
		
		res.status(200).json({
			token: token,
			userId: user._id.toString(),
			username: user.username,
			email: user.email,
			admin: user.admin,
			tempPassword: user.tempPassword,
			expiresIn: 240
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.forgotPassword = async (req, res, next) => {
	const email = req.body.email;
	
	try {
		const user = await User.findOne({ email: email });
		
		if (!user) {
			const error = new Error('A user with this email address could not be found.');
			error.statusCode = 401;
			return next(error);
		}
		
		const newPassword = passwordGenerator.generate({
			length: 8,
			numbers: true
		});
		
		user.password = await bcrypt.hash(newPassword, 12);
		user.tempPassword = true;
		const updatedUser = await user.save();
		
		transporter.sendMail({
			to: email,
			from: process.env.SENDGRID_FROM_EMAIL,
			subject: 'Video Game Reviews - Forgot Password',
			html: `
				<p>You received this email because you've indicated that you forgot your password.</p>
				<p>Your temporary password is: ${newPassword}</p>
				<p>Please use this to log in to <a href="http://localhost:3000/auth">Video Game Reviews</a></p>
			`
		}, (err) => {
			if (err) {
				const error = new Error(err);
				error.statusCode = 401;
				throw error;
			}
			
			res.status(200).json({
				message: 'We\'ve sent a password reset email to ' + email
			});
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};

exports.changePassword = async (req, res, next) => {
	const userId = req.body.userId;
	const currentPassword = req.body.currentPassword;
	const newPassword = req.body.newPassword;
	
	try {
		const user = await User.findById(userId);
		
		if (!user) {
			const error = new Error('User not found.');
			error.statusCode = 401;
			return next(error);
		}
		
		const isEqual = await bcrypt.compare(currentPassword, user.password);
		if (!isEqual) {
			const error = new Error('Current password is incorrect. Please try again.');
			error.statusCode = 401;
			return next(error);
		}
		
		user.password = await bcrypt.hash(newPassword, 12);
		user.tempPassword = false;
		const updatedUser = await user.save();
		
		res.status(200).json({
			message: 'Your password has been changed successfully.'
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};
