// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');

// configuration ===========================================
	
// config files
//var db = require('./config/db');

var port = process.env.PORT || 8080; // set our port

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

var controllers = require('./app/controllers/positions');
app.use(controllers);

// start app ===============================================
app.listen(port);	
console.log('Listening on port ' + port);	// shoutout to the user
exports = module.exports = app; 			// expose app