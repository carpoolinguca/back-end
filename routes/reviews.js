function ReviewRouter(sequelize) {
  var express = require('express');
  var router = express.Router();

  var ExpressBrute = require('express-brute');
  var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production 
  var bruteforce = new ExpressBrute(store);

  var ReputationSystem = require('../controllers/reputation-system');
  var reputationSystem = new ReputationSystem(sequelize);
  var AuthorizationSystem = require('../controllers/authorization-system.js');
  var authorizationSystem = new AuthorizationSystem(sequelize);


  router.route('/').get(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.reviews(function(reviews) {
      res.json(reviews);
    });
  });

  router.route('/for/driver').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.registerReviewAboutDriver(req.body, function(review) {
      res.json({
        receibed: "Ok",
        error: "",
        driverReview: {
          id: review.id,
          driverId: review.driverId,
          points: review.points,
          passengerId: review.passengerId,
          reviewTitle: review.reviewTitle,
          detailReview: review.detailReview,
        }
      });
    });
  });

  router.route('/for/driver/find').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.nameAndReputationForUserId(req.body.userId, function(userReputation) {
      reputationSystem.driverReviewsByUserId(req.body.userId, function(reviews) {
        res.json({
          userReviewed: {
            id: userReputation.userId,
            name: userReputation.name,
            lastname: userReputation.lastname
          },
          drivingPoints: userReputation.drivingPoints,
          reviews: reviews
        });
      });
    });
  });

  router.route('/for/passenger').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.registerReviewAboutPassenger(req.body, function(review) {
      res.json({
        receibed: "Ok",
        error: "",
        passengerReview: {
          id: review.id,
          driverId: review.driverId,
          points: review.points,
          passengerId: review.passengerId,
          reviewTitle: review.reviewTitle,
          detailReview: review.detailReview,
        }
      });
    });
  });

  router.route('/for/passenger/find').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    reputationSystem.nameAndReputationForUserId(req.body.userId, function(userReputation) {
      reputationSystem.passengerReviewsByUserId(req.body.userId, function(reviews) {
        res.json({
          userReviewed: {
            id: userReputation.userId,
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