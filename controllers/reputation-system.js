var Sequelize;
var Reputation;
var Complaint;
var Review;

function ReputationSystem(sequelize) {
	Reputation = require('../models/reputation')(sequelize);
	Complaint = require('../models/complaint')(sequelize);
	Review = require('../models/review')(sequelize);
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

ReputationSystem.prototype.complaints = function(callback) {
	Complaint.findAll().then(function(foundComplaints) {
		callback(foundComplaints);
	});
};

ReputationSystem.prototype.complaintsToUserById = function(userId, callback) {
	Complaint.findAll({
		where: {
			userTo: userId
		}
	}).then(function(foundComplaints) {
		callback(foundComplaints);
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

ReputationSystem.prototype.reputationForUserById = function(userId, callback) {
	Reputation.findOne({
		where: {
			userId: userId
		}
	}).then(function(readedReputation) {
		callback(readedReputation);
	});
};

ReputationSystem.prototype.reviews = function(callback) {
	Review.findAll().then(function(foundReviews) {
		callback(foundReviews);
	});
};

ReputationSystem.prototype.driverReviewsByUserId = function(userId, callback) {
	Review.findAll({
		where: {
			driverId: userId
		}
	}).then(function(foundComplaints) {
		callback(foundComplaints);
	});
};

ReputationSystem.prototype.registerReviewAboutDriver = function(driverReview, callback) {
	var self = this;
	Review.create({
		isDriver: true,
		driverId: driverReview.driverId,
		points: driverReview.points,
		passengerId: driverReview.passengerId,
		reviewTitle: driverReview.reviewTitle,
		detailReview: driverReview.detailReview
	}).then(function(reviewCreated) {
		self.refreshReputationForDriver(driverReview.driverId, function() {
			callback(reviewCreated);
		});
	});

};

ReputationSystem.prototype.refreshReputationForDriver = function(driverId, callback) {
	self = this;
	self.caculateReputationForDriver(driverId, function(reputationPoints) {
		self.reputationForUserById(driverId, function(foundReputation) {
			foundReputation.update({
				drivingPoints: reputationPoints
			}).then(function() {
				callback();
			});
		});

	});
};

ReputationSystem.prototype.caculateReputationForDriver = function(driverId, callback) {
	this.caculateReputationWhere({
		driverId: driverId
	}, callback);
};

ReputationSystem.prototype.caculateReputationForPassenger = function(passengerId, callback) {
	this.caculateReputationWhere({
		passengerId: passengerId
	}, callback);
};

ReputationSystem.prototype.caculateReputationWhere = function(whereCondition, callback) {
	//Hacer promedio de todas las reputaciones. 
	//suma de reputacion / count de reputaciones
	Review.sum('points', {
		where: whereCondition
	}).then(function(sum) {
		Review.count({
			where: whereCondition
		}).then(function(count) {
			callback(sum / count);
		});
	})
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
			$or: [{
				userTo: user.id
			}, {
				userFrom: user.id
			}]
		}
	}).then(function(numberOfDeleted) {
		callback();
	});
};

ReputationSystem.prototype.destroyAllReviewsFor = function(user, callback) {
	Review.destroy({
		where: {
			$or: [{
				driverId: user.id
			}, {
				passengerId: user.id
			}]
		}
	}).then(function(numberOfDeleted) {
		callback();
	});
};

ReputationSystem.prototype.destroyAllOpinionsFor = function(user, callback) {
	var self = this;
	self.destroyReputationFor(user, function() {
		self.destroyAllComplaintsFor(user, function() {
			self.destroyAllReviewsFor(user, function() {
				callback();
			});
		});
	});
};

module.exports = ReputationSystem;