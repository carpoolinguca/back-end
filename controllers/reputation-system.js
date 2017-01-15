var Sequelize;
var Reputation;
var Complaint;

function ReputationSystem(sequelize) {
	Reputation = require('../models/reputation')(sequelize);
	Complaint = require('../models/complaint')(sequelize);
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

ReputationSystem.prototype.registerComplaint = function(complaint, callback) {
	Complaint.create(complaint).then(function(complaintCreated) {
		callback(complaintCreated);
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

ReputationSystem.prototype.destroyReputationFor = function(user, next) {
	Reputation.findOne({
		where: {
			userId: user.id
		}
	}).then(function(reputation) {
		reputation.destroy();
		next();
	});
};

ReputationSystem.prototype.destroyAllComplaintsFor = function(user, callback) {
	Complaint.destroy({
		where: {
			userTo: user.id
		}
	}).then(function(numberOfDeleted) {
		callback();
	});
};

ReputationSystem.prototype.destroyAllOpinionsFor = function(user, callback) {
	var self = this;
	self.destroyReputationFor(user, function() {
		self.destroyAllComplaintsFor(user, function() {
			callback();
		})
	});
};

module.exports = ReputationSystem;