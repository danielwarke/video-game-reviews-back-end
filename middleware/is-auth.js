const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');
	
	try {
		if (!authHeader) {
			const error = new Error('Not authenticated.');
			error.statusCode = 401;
			throw error;
		}
		
		const token = authHeader.split(' ')[1];
		console.log(token);
		const decodedToken = jwt.verify(token, 'videogamesarefun');
		console.log(decodedToken);
		
		if (!decodedToken) {
			const error = new Error('Not authenticated.');
			error.statusCode = 401;
			throw error;
		}
		
		req.userId = decodedToken.userId;
		next();
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		
		next(err);
	}
};
