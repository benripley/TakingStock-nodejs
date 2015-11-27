var port = process.env.PORT || 8080; // set our port

// modules =================================================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var passport 	= require('./app/config/auth');
var cors = require('cors')

var corsOptions = { origin: 'http://localhost:3000' };
app.use(cors(corsOptions));

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// routes
require('./app/controllers/account')(app, passport);
require('./app/controllers/positions')(app, passport);


// start app ===============================================
app.listen(port);	
console.log('Listening on port ' + port);	// shoutout to the user
exports = module.exports = app; 			// expose app