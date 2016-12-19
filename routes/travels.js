function TravelRouter(sequelize) {
  var express = require('express');
  var router = express.Router();
  var jwt = require('jwt-simple');
  var moment = require('moment');
  var config = require('../config');

  var userSystem = require('../models/user')(sequelize);
  var Travel = require('../models/travel')(sequelize);
  var TravelAdministrationSystem = require('../controllers/travel-administration-system');
  var travelAdministrationSystem = new TravelAdministrationSystem(sequelize);

  var TokenCreator = require('../controllers/token-creator.js');
  var tokenCreator = new TokenCreator();


  function isAuthenticated(req, res, next) {
    if (!(req.headers && req.headers.authorization)) {
      return res.status(400).send({
        message: 'You did not provide a JSON Web Token in the Authorization header.'
      });
    }

    var header = req.headers.authorization.split(' ');
    var token = header[1];
    var payload = jwt.decode(token, config.tokenSecret);
    var now = moment().unix();

    if (now > payload.exp) {
      return res.status(401).send({
        message: 'Token has expired.'
      });
    }

    userSystem.findById(payload.sub).then(function(user) {
      if (!user) {
        return res.status(400).send({
          message: 'User no longer exists. :(',
          payload: payload.sub,
          user: user
        });
      }

      req.user = user;
      next();
    });
  }

  router.route('/').get(isAuthenticated, function(req, res) {
    travelAdministrationSystem.findAll(function(travels) {
      res.json(travels);
    });
  }).post(isAuthenticated, function(req, res) {
    console.log(req.body);
    travelAdministrationSystem.startManagingAndCalculateRoutes(req.body, function(registeredTravel) {
      res.json({
        travel: registeredTravel,
        receibed: 'Ok'
      });
    });
  });

  router.route('/find').post(isAuthenticated, function(req, res) {
    travelAdministrationSystem.findClosestTravelsForTravel(req.body, function(travels) {
      res.json(travels);
    });
  });



  router.route('/suits').post(isAuthenticated, function(req, res) {
    travelAdministrationSystem.asignSeatWith(req.body.parentTravel, req.body.childTravel, function(isAsigned) {
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

  return router;
}
module.exports = TravelRouter;