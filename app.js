const config = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@videogamereviews.ot9nw.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');
const videoGameRoutes = require('./routes/video-game');
const commentRoutes = require('./routes/comment');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	
	next();
});

app.use(authRoutes);
app.use(reviewRoutes);
app.use(videoGameRoutes);
app.use(commentRoutes);

app.use((error, req, res, next) => {
	console.error(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(result => {
	app.listen(process.env.PORT || process.env.DEFAULT_PORT);
}).catch(err => console.error(err));
