var Sequelize;
var User;
var Car;

function CarSystem(sequelize) {
	User = require('../models/user')(sequelize);
	Car = require('../models/car')(sequelize);
	Sequelize = sequelize;
}


CarSystem.prototype.carsForUserById = function(userId, callback) {
	Car.findAll({
		where: {
			userId: userId
		}
	}).then(function(carsFound) {
		callback(carsFound);
	});
};

CarSystem.prototype.complaints = function(callback) {
	Complaint.findAll().then(function(foundComplaints) {
		callback(foundComplaints);
	});
};

CarSystem.prototype.complaintsToUserById = function(userId, callback) {
	var queryString = 'select c."userFrom", u.name, u.lastname, c."reason" from "user" as u inner join complaint as c on (u.id = c."userFrom" ) where c."userTo" = ' + userId + ' ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
	});
};

CarSystem.prototype.reputationsFilteredBy = function(parameters, callback) {
	Reputation.findAll(parameters).then(function(Reputations) {
		callback(Reputations);
	});
};

CarSystem.prototype.reputationIdentifiedBy = function(identification, callback) {
	Reputation.findById(identification).then(function(readedReputation) {
		callback(readedReputation);
	});
};

CarSystem.prototype.nameAndReputationForUserId = function(userId, callback) {
	var queryString = 'select r."userId", u.name, u.lastname, r.complaints, r."passengerPoints", r."drivingPoints" from "user" as u inner join reputation as r on (u.id = r."userId" ) where r."userId" = ' + userId + ' limit 1;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results[0]);
	});
};

CarSystem.prototype.reputationForUserId = function(userId, callback) {
	Reputation.findOne({
		where: {
			userId: userId
		}
	}).then(function(reputationFound) {
		callback(reputationFound);
	});
};

CarSystem.prototype.reviews = function(callback) {
	Review.findAll().then(function(foundReviews) {
		callback(foundReviews);
	});
};

CarSystem.prototype.driverReviewsByUserId = function(userId, callback) {
	var queryString = 'select d."passengerId", u.name, u.lastname, d."points", d."reviewTitle", d."detailReview" from "user" as u inner join review as d on (u.id = d."passengerId" ) where d."driverId" = ' + userId + ' and d."isDriver" = true ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
	});
};

CarSystem.prototype.passengerReviewsByUserId = function(userId, callback) {
	var queryString = 'select d."driverId", u.name, u.lastname, d."points", d."reviewTitle", d."detailReview" from "user" as u inner join review as d on (u.id = d."driverId" ) where d."passengerId" = ' + userId + ' and d."isDriver" = false ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
	});
};

CarSystem.prototype.registerReviewAboutDriver = function(driverReview, callback) {
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

CarSystem.prototype.registerReviewAboutPassenger = function(passengerReview, callback) {
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
CarSystem.prototype.refreshReputationForDriver = function(driverId, callback) {
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

CarSystem.prototype.refreshReputationForPassenger = function(passengerId, callback) {
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

CarSystem.prototype.caculateReputationForDriver = function(driverId, callback) {
	this.caculateReputationWhere({
		driverId: driverId
	}, callback);
};

CarSystem.prototype.caculateReputationForPassenger = function(passengerId, callback) {
	this.caculateReputationWhere({
		passengerId: passengerId
	}, callback);
};

CarSystem.prototype.caculateReputationWhere = function(whereCondition, callback) {
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

CarSystem.prototype.destroy = function(callback) {
	Reputation.destroy({
		truncate: true
	}).then(function() {
		//CarSystem.destroy(callback());
	});
};

CarSystem.prototype.destroyReputationFor = function(user, next) {
	Reputation.findOne({
		where: {
			userId: user.id
		}
	}).then(function(reputation) {
		reputation.destroy();
		next();
	});
};

CarSystem.prototype.destroyAllComplaintsFor = function(user, callback) {
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

CarSystem.prototype.destroyAllReviewsFor = function(user, callback) {
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

CarSystem.prototype.destroyAllOpinionsFor = function(user, callback) {
	var self = this;
	self.destroyReputationFor(user, function() {
		self.destroyAllComplaintsFor(user, function() {
			self.destroyAllReviewsFor(user, function() {
				callback();
			});
		});
	});
};

module.exports = CarSystem;