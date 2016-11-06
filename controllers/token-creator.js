
var jwt = require('jwt-simple');
var moment = require('moment');

var config = require('../config');

function TokenCreator () {

}

TokenCreator.prototype.create = function (user) {
  var payload = {
    exp: moment().add(14, 'days').unix(),
    iat: moment().unix(),
    sub: user.id
  };

  return jwt.encode(payload, config.tokenSecret);
};

module.exports = TokenCreator;