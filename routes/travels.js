function TravelRouter(sequelize) {
  var express = require('express');
  var router = express.Router();

  var ExpressBrute = require('express-brute');
  var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production 
  var bruteforce = new ExpressBrute(store, {freeRetries: 1000});

  var TravelAdministrationSystem = require('../controllers/travel-administration-system');
  var travelAdministrationSystem = new TravelAdministrationSystem(sequelize);
  var AuthorizationSystem = require('../controllers/authorization-system.js');
  var authorizationSystem = new AuthorizationSystem(sequelize);


  router.route('/').get(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.findAll(function(travels) {
      res.json(travels);
    });
  }).post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    console.log(req.body);
    travelAdministrationSystem.startManagingAndCalculateRoutes(req.body, function(err, registeredTravel) {
      if (err) {
        res.json({
          travel: registeredTravel,
          receibed: 'Error',
          error: err
        });
      } else {
        res.json({
          travel: registeredTravel,
          receibed: 'Ok'
        });
      }
    });
  });

  router.route('/find').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    console.log(req.body);
    travelAdministrationSystem.findClosestTravelsForTravel(req.body, function(searchResult) {
      res.json(searchResult);
    });
  });


  router.route('/for/user').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.travelsForUserIdentifiedBy(req.body.userId, function(travels) {
      res.json(travels);
    });
  });

  router.route('/for/user/passenger').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.travelsForPassengerIdentifiedBy(req.body.userId, function(travels) {
      res.json(travels);
    });
  });

  router.route('/for/user/driver').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.travelsForDriverIdentifiedBy(req.body.userId, function(travels) {
      res.json(travels);
    });
  });

  router.route('/travel/start').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.changeToInProgressTravel(req.body.travelId, function(successful) {
      res.json({
        started: successful
      });
    });
  });

  router.route('/travel/end').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.changeToEndedTravel(req.body.travelId, function(successful) {
      res.json({
        ended: successful
      });
    });
  });

  router.route('/travel/cancel').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.changeToCanceledTravel(req.body.travelId, function(successful) {
      res.json({
        canceled: successful
      });
    });
  });

  router.route('/travel/car/update').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.updateCarForTravelById(req.body.travelId, req.body.carId, function(err, updatedTravel) {
      if (err) {
        res.send({
          receibed: 'Error',
          error: err.message
        });
      } else {
        res.send({
          travel: updatedTravel,
          receibed: 'Ok',
          error: ''
        });
      }
    });
  });

  router.route('/suits/book').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.bookSeatWith(req.body.parentTravel, req.body.childTravel, function(bookingResult) {
      res.json(bookingResult);
    });
  });

  router.route('/suits/confirm').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
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

  router.route('/suits/reject').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
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

  router.route('/suits/find').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
    travelAdministrationSystem.seatsForParentTravel(req.body.parentTravel, function(seats) {
      res.json(seats);
    });
  });

  router.route('/suits/status').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
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