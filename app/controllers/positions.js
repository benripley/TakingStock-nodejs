var express = require('express');
var router = express.Router();
var azure = require('azure-storage');
var Position = require('../models/position');
var loadconfig = require('../config/loadconfig'); // load the config from environment vars (production) or /config.json file (dev)

var config = loadconfig.CONFIG;
var position = new Position(azure.createTableService(config.accountName, config.accountKey));


module.exports = function(app, passport) {
  app.get('/api/positions', 
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
      position.all(function positionsFound(error, items) {
        if(error) {
          throw error;
        } else {
          res.json(items);
        }
      });
  });

  app.get('/api/positions/:id', 
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
      position.findById(req.params.id, function positionFound(error, item) {
        if(error) {
          throw error;
        } else {
          res.json(item);
        }
      });
  });
  
  app.post('/api/positions',
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
      var newPosition = {}; // get from body-parser
      position.create(newPosition, function positionDeleted(error, item) {
        if(error) {
          throw error;
        } else {
          res.send(201); // return position with id...
        }     
      });
    }
  )
  
  app.delete('/api/positions',  
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
      position.delete(req.params.id, function positionDeleted(error, item) {
        if(error) {
          throw error;
        } else {
          res.send(200);
        }     
      });
  });
  
};
