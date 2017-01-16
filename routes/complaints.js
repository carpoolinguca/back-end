function ComplaintRouter(sequelize) {
  var express = require('express');
  var router = express.Router();

  var ReputationSystem = require('../controllers/reputation-system');
  var reputationSystem = new ReputationSystem(sequelize);
  var AuthorizationSystem = require('../controllers/authorization-system.js');
  var authorizationSystem = new AuthorizationSystem(sequelize);


  router.route('/').get(authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.complaints(function(complaints) {
      res.json(complaints);
    });
  }).post(authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.registerComplaint(req.body, function(registerComplaint) {
      res.json({
        complaint: registerComplaint,
        receibed: 'Ok'
      });
    });
  });

  router.route('/find').post(authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.complaintsToUserById(req.body.userId, function(complaints) {
      res.json(complaints);
    });
  });

  return router;
}
module.exports = ComplaintRouter;