function ReviewRouter(sequelize) {
  var express = require('express');
  var router = express.Router();

  var ReputationSystem = require('../controllers/reputation-system');
  var reputationSystem = new ReputationSystem(sequelize);
  var AuthorizationSystem = require('../controllers/authorization-system.js');
  var authorizationSystem = new AuthorizationSystem(sequelize);


  router.route('/').get(authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.reviews(function(reviews) {
      res.json(reviews);
    });
  });

  router.route('/for/driver').post(authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.registerReviewAboutDriver(req.body, function(review) {
      res.json(review);
    });
  });

  router.route('/for/driver/find').post(authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.nameAndReputationForUserId(req.body.userId, function(userReputation) {
      reputationSystem.driverReviewsByUserId(req.body.userId, function(reviews) {
        res.json({
          userReviewed: {
            name: userReputation.name,
            lastname: userReputation.lastname
          },
          drivingPoints: userReputation.drivingPoints,
          reviews: reviews
        });
      });
    });
  });

  router.route('/for/passenger').post(authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.registerReviewAboutPassenger(req.body, function(review) {
      res.json(review);
    });
  });

  router.route('/for/passenger/find').post(authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.nameAndReputationForUserId(req.body.userId, function(userReputation) {
      reputationSystem.passengerReviewsByUserId(req.body.userId, function(reviews) {
        res.json({
          userReviewed: {
            name: userReputation.name,
            lastname: userReputation.lastname
          },
          passengerPoints: userReputation.passengerPoints,
          reviews: reviews
        });
      });
    });
  });

  return router;
}
module.exports = ReviewRouter;