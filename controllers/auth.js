var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var UserPersistenceManagerForAuth = require('./user-persistence-manager.js');
var userPersistenceManagerForAuth = new UserPersistenceManagerForAuth();

passport.use(new BasicStrategy(
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

exports.isAuthenticated = passport.authenticate('basic', { session : false });
