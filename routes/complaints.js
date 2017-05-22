function ComplaintRouter(sequelize) {
  var express = require('express');
  var router = express.Router();

  var ExpressBrute = require('express-brute');
  var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production 
  var bruteforce = new ExpressBrute(store, {freeRetries: 100});

  var ReputationSystem = require('../controllers/reputation-system');
  var reputationSystem = new ReputationSystem(sequelize);
  var AuthorizationSystem = require('../controllers/authorization-system.js');
  var authorizationSystem = new AuthorizationSystem(sequelize);


  router.route('/').get(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.complaints(function(complaints) {
      res.json(complaints);
    });
  }).post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.registerComplaint(req.body, function(registerComplaint) {
      res.json({
        complaint: registerComplaint,
        receibed: 'Ok'
      });
    });
  });

  router.route('/find').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.nameAndReputationForUserId(req.body.userId, function(userReputation) {
      reputationSystem.complaintsToUserById(req.body.userId, function(complaints) {
        res.json({
          userComplained: {name: userReputation.name, lastname: userReputation.lastname},
          numberOfComplains: userReputation.complaints,
          complaints: complaints
        });
      });
    });
  });

  return router;
}
module.exports = ComplaintRouter;