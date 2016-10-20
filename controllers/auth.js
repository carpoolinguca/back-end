var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer');

var UserPersistenceManagerForAuth = require('./user-persistence-manager.js');
var userPersistenceManagerForAuth = new UserPersistenceManagerForAuth();

var ClientPersistenceManagerForAuth = require('./client-persistence-manager.js');
var clientPersistenceManagerForAuth = new ClientPersistenceManagerForAuth();

var TokenPersistenceManagerForAuth = require('./token-persistence-manager.js');
var tokenPersistenceManagerForAuth = new TokenPersistenceManagerForAuth();

passport.use('basic', new BasicStrategy(
  function(username, password, callback) {
    userPersistenceManagerForAuth.findOne(username , function (user) {
      // No user found with that username
      if (!user) { return callback(null, false); }

      // Make sure the password is correct
      if (user.password == password) 
          {return callback(null, user);}
      else
          {return callback(null, false);}
      });
    }));

passport.use('client-basic', new BasicStrategy(
  function(username, password, callback) {
    clientPersistenceManagerForAuth.findOneById(username, function (err, client) {
      if (err) { return callback(err); }

      // No client found with that id or bad password
      if (!client || client.secret !== password) { return callback(null, false); }

      // Success
      return callback(null, client);
    });
  }
));

passport.use(new BearerStrategy(
  function(accessToken, callback) {
    tokenPersistenceManagerForAuth.findByValue(accessToken, function (err, token) {
      if (err) { return callback(err); }

      // No token found
      if (!token) { return callback(null, false); }

      userPersistenceManagerForAuth.findById(token.userId, function (err, user) {
        if (err) { return callback(err); }

        // No user found
        if (!user) { return callback(null, false); }

        // Simple example with no scope
        callback(null, user, { scope: '*' });
      });
    });
  }
));

exports.isAuthenticated = passport.authenticate('basic', { session : false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });
