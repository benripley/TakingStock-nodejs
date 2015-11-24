var express = require('express');
var router = express.Router();
var azure = require('azure-storage');
var Position = require('../models/position');
var loadconfig = require('../config/loadconfig'); // load the config from environment vars (production) or /config.json file (dev)

var config = loadconfig.CONFIG;
var position = new Position(azure.createTableService(config.accountName, config.accountKey));

router.get('/api/positions', function(req, res) {
  position.all(function positionsFound(error, items) {
      if(error) {
        throw error;
      } else {
        res.json(items);
      }
    });
});

router.get('/api/positions/:id', function(req, res) {
  position.find(req.params.id, function positionFound(error, item) {
      if(error) {
        throw error;
      } else {
        res.json(item);
      }
    });
});

router.post('/api/positions'), function(req, res) {
  position.create()
}


module.exports = router