var Sequelize;
var Reputation;

function ReputationSystem(sequelize) {
	Reputation = require('../models/reputation')(sequelize);
	Sequelize = sequelize;
}

ReputationSystem.prototype.initializeReputationFor = function(user, callback) {
	reputation = {
		userId: user.id,
		drivingPoints: 0,
		passengerPoints: 0
	};
	Reputation.create(reputation).then(function(reputationCreated) {
		callback(reputationCreated);
	});
};

ReputationSystem.prototype.reputationsFilteredBy = function(parameters, callback) {
	Reputation.findAll(parameters).then(function(Reputations) {
		callback(Reputations);
	});
};

ReputationSystem.prototype.reputationIdentifiedBy = function(identification, callback) {
	Reputation.findById(identification).then(function(readedReputation) {
		callback(readedReputation);
	});
};

ReputationSystem.prototype.destroy = function(callback) {
	Reputation.destroy({
		truncate: true
	}).then(function() {
		//reputationSystem.destroy(callback());
	});
};


ReputationSystem.prototype.destroyReputationFor = function(user, callback) {
	Reputation.findOne({
		where: {
			userId: user.id
		}
	}).then(function(reputation) {
		reputation.destroy();
		callback();
	});
};

module.exports = ReputationSystem;