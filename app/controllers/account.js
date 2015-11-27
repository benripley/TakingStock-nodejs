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
  
  app.post('/account/token', function(req, res) {
    
    if(!req.body || !req.body.username || !req.body.password) res.sendStatus(400);
    
    user.login(req.body.username, req.body.password, function usersFound(error, user) {
        if(error) {
          throw error;
        } else {
          res.json({ access_token: user.token });
        }
      });
  }),
  
  app.post('/account/signup', function(req, res) {
    
    if(!req.body || !req.body.email || !req.body.password) 
      res.sendStatus(400);
    
    user.findByUsername(req.body.email, function userFound(error, u) {
      if(u) {
        res.status(409).json({ message: 'That email is already in use.' })
      }
      else {
        user.create(req.body.email, req.body.password, function(newUser){
          res.json({ access_token: newUser.token });
        });
      }
    });
  }),
   
  app.get('/account/profile', 
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
      res.json(req.user);
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