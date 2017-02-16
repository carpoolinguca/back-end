function TravelRouter(sequelize) {
  var express = require('express');
  var router = express.Router();

  var TravelAdministrationSystem = require('../controllers/travel-administration-system');
  var travelAdministrationSystem = new TravelAdministrationSystem(sequelize);
  var AuthorizationSystem = require('../controllers/authorization-system.js');
  var authorizationSystem = new AuthorizationSystem(sequelize);


  router.route('/').get(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.findAll(function(travels) {
      res.json(travels);
    });
  }).post(authorizationSystem.isAuthenticated, function(req, res) {
    console.log(req.body);
    travelAdministrationSystem.startManagingAndCalculateRoutes(req.body, function(registeredTravel) {
      res.json({
        travel: registeredTravel,
        receibed: 'Ok'
      });
    });
  });

  router.route('/find').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.findClosestTravelsForTravel(req.body, function(travels) {
      res.json(travels);
    });
  });



  router.route('/suits').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.bookSeatWith(req.body.parentTravel, req.body.childTravel, function(isAsigned) {
      if (isAsigned) {
        res.json({
          asigned: isAsigned,
          error: ''
        });
      } else {
        res.json({
          asigned: isAsigned,
          error: 'No quedan más asientos disponibles.'
        });
      }
    });
  });

  router.route('/suits/find').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.seatsForParentTravel(req.body.parentTravel, function(seats) {
      res.json(seats);
    });
  });

  return router;
}
module.exports = TravelRouter;