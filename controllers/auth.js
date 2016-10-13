var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

var UserPersistenceManagerForAuth = require('./user-persistence-manager.js');
var userPersistenceManagerForAuth = new UserPersistenceManagerForAuth();

var ClientPersistenceManagerForAuth = require('./client-persistence-manager.js');
var clientPersistenceManagerForAuth = new ClientPersistenceManagerForAuth();


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


exports.isAuthenticated = passport.authenticate('basic', { session : false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
