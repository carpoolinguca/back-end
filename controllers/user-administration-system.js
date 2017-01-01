var ReputationSystem = require('../controllers/reputation-system.js');
var reputationSystem;

var Sequelize;
var User;

function UserAdministrationSystem(sequelize) {
	User = require('../models/user')(sequelize);
	reputationSystem = new ReputationSystem(sequelize);
	Sequelize = sequelize;
}

UserAdministrationSystem.prototype.register = function(user, callback) {
	User.create(user).then(function(userCreated) {
		reputationSystem.initializeReputationFor(userCreated, function() {
			callback(userCreated);
		});
	});
};

UserAdministrationSystem.prototype.UsersFilteredBy = function(parameters, callback) {
	User.findAll(parameters).then(function(Users) {
		callback(Users);
	});
};

UserAdministrationSystem.prototype.userIdentifiedBy = function(identification, callback) {
	User.findById(identification).then(function(readedUser) {
		callback(readedUser);
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
	reputationSystem.destroyReputationFor(user, function(){
		user.destroy();
	});
};


module.exports = UserAdministrationSystem;