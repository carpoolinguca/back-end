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


  router.route('/for/user').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.travelsForUserIdentifiedBy(req.body.userId, function(travels) {
      res.json(travels);
    });
  });

  router.route('/travel/start').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.changeToInProgressTravel(req.body, function(successful) {
      res.json({
        started: successful
      });
    });
  });

  router.route('/travel/end').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.changeToEndedTravel(req.body, function(successful) {
      res.json({
        ended: successful
      });
    });
  });

  router.route('/travel/cancel').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.changeToCanceledTravel(req.body, function(successful) {
      res.json({
        canceled: successful
      });
    });
  });

  router.route('/suits/book').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.bookSeatWith(req.body.parentTravel, req.body.childTravel, function(isAsigned) {
      if (isAsigned) {
        res.json({
          booked: isAsigned,
          error: ''
        });
      } else {
        res.json({
          booked: isAsigned,
          error: 'No quedan más asientos disponibles.'
        });
      }
    });
  });

  router.route('/suits/confirm').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.confirmSeatBookingWith(req.body.seatAssignationId, function(isConfirmed) {
      if (isConfirmed) {
        res.json({
          confirmed: isConfirmed,
          error: ''
        });
      } else {
        res.json({
          confirmed: isConfirmed,
          error: 'No quedan más asientos disponibles.'
        });
      }
    });
  });

  router.route('/suits/reject').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.rejectSeatBookingWith(req.body.seatAssignationId, function(isRejected) {
      if (isRejected) {
        res.json({
          rejected: isRejected,
          error: ''
        });
      } else {
        res.json({
          confirmed: isRejected,
          error: 'No se ha podido rechazar la reserva.'
        });
      }
    });
  });

  router.route('/suits/find').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.seatsForParentTravel(req.body.parentTravel, function(seats) {
      res.json(seats);
    });
  });

  router.route('/suits/status').post(authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.seatIdentifiedBy(req.body.seatId, function(seat) {
      res.json({
        suit: seat,
        error: ''
      });
    }, function(error) {
      res.json({
        error: error
      });
    });
  });

  return router;
}
module.exports = TravelRouter;