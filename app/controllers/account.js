var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var azure = require('azure-storage');
var User = require('../models/user');
var loadconfig = require('../config/loadconfig'); // load the config from environment vars (production) or /config.json file (dev)

var config = loadconfig.CONFIG;
var user = new User(azure.createTableService(config.accountName, config.accountKey));

var jsonParser = bodyParser.json()

module.exports = function(app, passport) {
  
  app.post('/account/login', jsonParser, function(req, res) {
    res.json(req.body);
  }),
  
  app.post('/account/signup', function(req, res) {
    var u = { email: 'ben.ripley@gmail.com', token: 'test'};
    user.create(u, function(){
      res.sendStatus(201); 
    });
  }),
  
  app.get('/auth/all', 
    function(req, res) {
      user.all(function userFound(error, items) {
        if(error) {
          throw error;
        } else {
          res.json(items);
        }
      });
  }),
  
  app.get('/auth/:username', 
    function(req, res) {
      user.findByUsername(req.params.username, function userFound(error, u) {
        if(error) {
          throw error;
        } else {
          res.json(u);
        }
      });
  }),
  
  
  
  app.get('/auth/facebook',
    passport.authenticate('facebook', { session: false, scope: [] })
  ),

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: "/" }),
    function(req, res) {
      res.redirect("/profile?access_token=" + req.user.access_token);
    }
  );
}