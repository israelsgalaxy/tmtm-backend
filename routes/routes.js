const express = require('express')
const router = express.Router()
const login = require('./login')
const Data = require('../models/data')

router.use(login);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/auth/google");
}

// define the home page route
router.get('/', ensureAuthenticated, (req, res) => {
  res.send('server is running')
})

// Route for JSON data post
router.post('/data', ensureAuthenticated, (req, res) => {
	const data = new Data({ data: req.body });
	data.save((error) => {
		if (error) {
			return res.send(error);
		}
		res.json({ message: 'Data saved successfully' });
	});
});

module.exports = router

// sample data
// {
// 	"name": "John Doe",
// 	"date": "2023-01-12",
// 	"destination": "Lagos",
// 	"time": "11:30",
// 	"luggageSize": "medium"
// }