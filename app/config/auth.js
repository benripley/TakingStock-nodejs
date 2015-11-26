var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var azure = require('azure-storage');
var User = require('../models/user');
var loadconfig = require('../config/loadconfig'); // load the config from environment vars (production) or /config.json file (dev)

var config = loadconfig.CONFIG;
var user = new User(azure.createTableService(config.accountName, config.accountKey));

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new LocalStrategy(
  function(username, password, cb) {
    user.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));
  
// Configure the Bearer strategy for use by Passport.
//
// The Bearer strategy requires a `verify` function which receives the
// credentials (`token`) contained in the request.  The function must invoke
// `cb` with a user object, which will be set at `req.user` in route handlers
// after authentication.
passport.use(new BearerStrategy(function(token, cb) {
  user.findByToken(token, function(err, user) {
    if (err) { return cb(err); }
    if (!user) { return cb(null, false); }
    return cb(null, user);   
  });
}));

module.exports = passport;