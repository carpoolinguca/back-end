var ReputationSystem = require('../controllers/reputation-system.js');
var reputationSystem;
var bcrypt = require('bcrypt');
const saltRounds = 10;

var Sequelize;
var User;

function UserAdministrationSystem(sequelize) {
	User = require('../models/user')(sequelize);
	reputationSystem = new ReputationSystem(sequelize);
	Sequelize = sequelize;
}

UserAdministrationSystem.prototype.register = function(user, callback) {
	bcrypt.hash(user.password, saltRounds, function(err, hash) {
		user.password = hash;
		User.create(user).then(function(userCreated) {
			reputationSystem.initializeReputationFor(userCreated, function() {
				callback({
					id: userCreated.id,
					email: userCreated.email,
					name: userCreated.name,
					lastname: userCreated.lastname,
					ucaid: userCreated.ucaid,
					sex: userCreated.sex,
					phone: userCreated.phone
				});
			});
		});
	});
};

UserAdministrationSystem.prototype.usersFilteredBy = function(parameters, callback) {
	User.findAll(parameters).then(function(users) {
		callback(users);
	});
};

UserAdministrationSystem.prototype.oneUserFilteredBy = function(parameters, callback) {
	User.findOne(parameters).then(function(user) {
		callback(user);
	});
};

UserAdministrationSystem.prototype.userIdentifiedBy = function(identification, callback) {
	User.findById(identification).then(function(readedUser) {
		callback(readedUser);
	});
};

UserAdministrationSystem.prototype.validateEmailAndPassword = function(email, password, invalidEmailCallback, invalidPasswordCallback, validUserCallback) {
	this.oneUserFilteredBy({
		where: {
			email: email
		}
	}, function(user) {
		if (!user) {
			invalidEmailCallback();
		} else {
			bcrypt.compare(password, user.password, function(err, res) {
				if (res == true) {
					validUserCallback({
						id: user.id,
						email: user.email,
						name: user.name,
						lastname: user.lastname,
						ucaid: user.ucaid,
						sex: user.sex,
						phone: user.phone
					});
				} else {
					invalidPasswordCallback();
				}
			});
		}
	});
};

/*
UserAdministrationSystem.prototype.destroy = function(callback) {
	User.destroy({
		truncate: true
	}).then(function() {
		reputationSystem.destroy(callback());
	});
};
*/

UserAdministrationSystem.prototype.destroy = function(user, callback) {
	reputationSystem.destroyAllOpinionsFor(user, function() {
		user.destroy();
		callback();
	});
};


module.exports = UserAdministrationSystem;