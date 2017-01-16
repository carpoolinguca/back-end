var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../config');
var userSystem;

function AuthorizationSystem(sequelize) {
	userSystem = require('../models/user')(sequelize);
}

AuthorizationSystem.prototype.createTokenFor = function(user) {
	var payload = {
		exp: moment().add(14, 'days').unix(),
		iat: moment().unix(),
		sub: user.id
	};

	return jwt.encode(payload, config.tokenSecret);
};


AuthorizationSystem.prototype.isAuthenticated = function(req, res, next) {
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
};

module.exports = AuthorizationSystem;