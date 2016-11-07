function TravelRouter(sequelize) {
  var express = require('express');
  var router = express.Router();
  var jwt = require('jwt-simple');
  var moment = require('moment');
  var config = require('../config');

  var userSystem = require('../models/user')(sequelize);
  var travelSystem = require('../models/travel')(sequelize);
  var routeSystem = require('../models/route')(sequelize);

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
    })
  }

  router.route('/').get(isAuthenticated, function(req, res) {
    travelSystem.findAll().then(function(travels) {
      res.json(travels);
    });
  }).post(isAuthenticated, function(req, res) {
    travelSystem.create(req.body).then(function() {
      res.json({
        travel: req.body,
        receibed: 'Ok'
      });
    });
  });

  router.route('/suits').post(function(req, res) {
    res.json({
      status: "Reserved",
      receibed: 'Ok'
    });
  });

  return router;
}
module.exports = TravelRouter;