var Sequelize;
var Reputation;
var Complaint;
var Review;
var User;

function ReputationSystem(sequelize) {
	User = require('../models/user')(sequelize);
	Reputation = require('../models/reputation')(sequelize);
	Complaint = require('../models/complaint')(sequelize);
	Review = require('../models/review')(sequelize);
	Sequelize = sequelize;
}

ReputationSystem.prototype.initializeReputationFor = function(user, callback) {
	reputation = {
		userId: user.id,
		drivingPoints: 0,
		passengerPoints: 0,
		complaints: 0
	};
	Reputation.create(reputation).then(function(reputationCreated) {
		callback(reputationCreated);
	});
};

ReputationSystem.prototype.registerComplaint = function(complaint, callback) {
	Complaint.create(complaint).then(function(complaintCreated) {
		Reputation.findOne({
			where: {
				userId: complaintCreated.userTo
			}
		}).then(function(reputationFound) {
			reputationFound.increment('complaints').then(function() {
				callback(complaintCreated);
			});
		});
	});
};

ReputationSystem.prototype.complaints = function(callback) {
	Complaint.findAll().then(function(foundComplaints) {
		callback(foundComplaints);
	});
};

ReputationSystem.prototype.complaintsToUserById = function(userId, callback) {
	var queryString = 'select c."userFrom", u.name, u.lastname, c."reason" from "user" as u inner join complaint as c on (u.id = c."userFrom" ) where c."userTo" = ' + userId + ' ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
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

ReputationSystem.prototype.nameAndReputationForUserId = function(userId, callback) {
	var queryString = 'select r."userId", u.name, u.lastname, r.complaints, r."passengerPoints", r."drivingPoints" from "user" as u inner join reputation as r on (u.id = r."userId" ) where r."userId" = ' + userId + ' limit 1;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results[0]);
	});
};

ReputationSystem.prototype.reputationForUserId = function(userId, callback) {
	Reputation.findOne({
		where: {
			userId: userId
		}
	}).then(function(reputationFound) {
		callback(reputationFound);
	});
};

ReputationSystem.prototype.reviews = function(callback) {
	Review.findAll().then(function(foundReviews) {
		callback(foundReviews);
	});
};

ReputationSystem.prototype.driverReviewsByUserId = function(userId, callback) {
	var queryString = 'select d."passengerId", u.name, u.lastname, d."points", d."reviewTitle", d."detailReview" from "user" as u inner join review as d on (u.id = d."passengerId" ) where d."driverId" = ' + userId + ' and d."isDriver" = true ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
	});
};

ReputationSystem.prototype.passengerReviewsByUserId = function(userId, callback) {
	var queryString = 'select d."driverId", u.name, u.lastname, d."points", d."reviewTitle", d."detailReview" from "user" as u inner join review as d on (u.id = d."driverId" ) where d."passengerId" = ' + userId + ' and d."isDriver" = false ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
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

ReputationSystem.prototype.registerReviewAboutPassenger = function(passengerReview, callback) {
	var self = this;
	Review.create({
		isDriver: false,
		driverId: passengerReview.driverId,
		points: passengerReview.points,
		passengerId: passengerReview.passengerId,
		reviewTitle: passengerReview.reviewTitle,
		detailReview: passengerReview.detailReview
	}).then(function(reviewCreated) {
		self.refreshReputationForPassenger(passengerReview.passengerId, function() {
			callback(reviewCreated);
		});
	});

};
ReputationSystem.prototype.refreshReputationForDriver = function(driverId, callback) {
	self = this;
	self.caculateReputationForDriver(driverId, function(reputationPoints) {
		self.reputationForUserId(driverId, function(foundReputation) {
			foundReputation.update({
				drivingPoints: reputationPoints
			}).then(function() {
				callback();
			});
		});

	});
};

ReputationSystem.prototype.refreshReputationForPassenger = function(passengerId, callback) {
	self = this;
	self.caculateReputationForPassenger(passengerId, function(reputationPoints) {
		self.reputationForUserId(passengerId, function(foundReputation) {
			foundReputation.update({
				passengerPoints: reputationPoints
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