var RouteCalculatorSystem = require('../controllers/route-calculator-system.js');
var routeCalculatorSystem;

var Sequelize;
var Travel;

function TravelAdministrationSystem(sequelize) {
	Travel = require('../models/travel')(sequelize);
	SeatAsignation = require('../models/seat-asignation')(sequelize);
	routeCalculatorSystem = new RouteCalculatorSystem(sequelize);
	Sequelize = sequelize;
}


TravelAdministrationSystem.prototype.travelsFilteredBy = function(parameters, callback) {
	Travel.findAll(parameters).then(function(travels) {
		callback(travels);
	});
};


TravelAdministrationSystem.prototype.destroy = function(callback) {
	Travel.destroy({
		truncate: true
	}).then(function() {
		routeCalculatorSystem.destroy(callback());
	});
};


TravelAdministrationSystem.prototype.destroyWithoutRoutes = function(travel, callback) {
	SeatAsignation.destroy({
		where: {
			$or: [{
				childTravel: travel.id
			}, {
				parentTravel: travel.id
			}]
		}
	}).then(function() {
		travel.destroy().then(callback);
	});

};

TravelAdministrationSystem.prototype.startManaging = function(travel, callback) {
	var travelToCreate = {
		userId: travel.userId,
		origin: travel.origin,
		destination: travel.destination,
		userIsDriver: travel.userIsDriver,
		maximumSeats: travel.seats,
		availableSeats: travel.seats,
		arrivalDateTime: travel.arrivalDateTime,
		observations: travel.observations,
		status: 'planed'
	};
	Travel.create(travelToCreate).then(function(travelCreated) {
		callback(travelCreated);
	});
};

TravelAdministrationSystem.prototype.startManagingAndCalculateRoutes = function(travel, callback) {
	this.startManaging(travel, function(travelCreated) {
		routeCalculatorSystem.calculateForTravel(travelCreated.dataValues, function() {
			callback(travelCreated.dataValues);
		});
	});
};

TravelAdministrationSystem.prototype.findAll = function(endFunction) {
	Travel.findAll().then(function(results) {
		endFunction(results);
	});
};

//TODO: agregar filtrado por día de la fecha!
TravelAdministrationSystem.prototype.findClosestTravelsForTravel = function(travel, endFunction) {
	this.startManaging(travel, function(travelCreated) {
		routeCalculatorSystem.calculateForTravel(travelCreated.dataValues, function(routes) {
			var queryString = 'select * from travel where id in (select ro.travel_id from route as ro where  ST_DWithin(ro.polyline,ST_GeographyFromText(\'SRID=4326; POINT(' + routes[0].polyline.coordinates[0][0] + ' ' + routes[0].polyline.coordinates[0][1] + ' )\'), 1000) and ro.travel_id IN (select id from travel where "userIsDriver"=\'t\' and user_id != ' + travelCreated.userId + ' and "availableSeats" > 0 and destination = \'' + travelCreated.destination + '\'));';
			Sequelize.query(queryString).then(function(results) {
				endFunction(results[0]);
			});
		});
	});
};

TravelAdministrationSystem.prototype.routesForTravel = function(travel, callback) {
	console.log(travel);
	routeCalculatorSystem.routesForTravel(travel, function(routes) {
		callback(routes);
	});
};

TravelAdministrationSystem.prototype.rejectSeatBookingWith = function(assignationId, callback) {
	SeatAsignation.findById(assignationId).then(
		function(seatAssignation) {
			if (seatAssignation.status == 'pending' || seatAssignation.status == 'booked') {
				seatAssignation.status = 'rejected';
				seatAssignation.save().then(function() {
					Travel.findById(seatAssignation.parentTravel).then(function(parentTravel) {
						parentTravel.decrement('availableSeats');
					});
					callback(true);
				});
			} else {
				callback(false);
			}

		});
};

TravelAdministrationSystem.prototype.confirmSeatBookingWith = function(assignationId, callback) {
	SeatAsignation.findById(assignationId).then(
		function(seatAssignation) {
			if (seatAssignation.status == 'pending') {
				seatAssignation.status = 'booked';
				seatAssignation.save().then(function() {
					callback(true);
				});
			} else {
				callback(false);
			}

		});
};

TravelAdministrationSystem.prototype.bookSeatWith = function(parentTravelId, childTravelId, callback) {
	Travel.findById(parentTravelId).then(function(parentTravel) {
		if (parentTravel.availableSeats > 0) {
			parentTravel.decrement('availableSeats');
			SeatAsignation.create({
				parentTravel: parentTravelId,
				childTravel: childTravelId,
				status: 'pending'
			}).then(function(asignationCreated) {
				callback(true);
			});
		} else {
			callback(false);
		}
	});
};

TravelAdministrationSystem.prototype.seatsForParentTravel = function(parentTravelId, callback) {
	var queryString = 'select s.id, s."parentTravel", s."childTravel", s.status, t.user_id, u.email, u.name, u.lastname, u.sex, t.origin, t."arrivalDateTime" from seat_asignation as s inner join travel as t on (s."parentTravel" = t.id) inner join "user" as u on (t.user_id = u.id) where s."parentTravel" = ' + parentTravelId + ' ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
	});
};

TravelAdministrationSystem.prototype.changeToInProgressTravel = function(parentTravelId, callback) {
	var self = this;
	var condition = function(parentTravel) {
		return (parentTravel.status == 'planed' || parentTravel.status == 'inProgress');
	}
	this.changeToStatusSatisfayingCondition(parentTravelId, 'inProgress', condition, function() {
		self.changeStatusToChildTravelsRelatedTo(parentTravelId, 'inProgress', condition, callback);
	});
};

TravelAdministrationSystem.prototype.changeToStatusSatisfayingCondition = function(travelId, status, condition, callback) {
	var self = this;
	Travel.findById(travelId).then(function(travel) {
		if (condition(travel)) {
			travel.update({
				status: status
			}).then(function() {
				callback(true)
			});
		} else {
			callback(false);
		}
	});
};

TravelAdministrationSystem.prototype.changeStatusToChildTravelsRelatedTo = function(parentTravelId, status, condition, callback) {
	var self = this;
	SeatAsignation.findAll({
		where: {
			parentTravel: parentTravelId,
			$and: {
				status: 'booked'
			}
		}
	}).then(function(assignations) {
		assignations.forEach(function(currentValue, index, arr) {
			self.changeToStatusSatisfayingCondition(currentValue.childTravel, status, condition, function() {});
		});
		callback(true);
	});
};

TravelAdministrationSystem.prototype.changeToEndedTravel = function(parentTravelId, callback) {
	Travel.findById(parentTravelId).then(function(parentTravel) {
		if (parentTravel.status == 'inProgress') {
			parentTravel.update({
				status: 'ended'
			}).then(function() {
				callback(true);
			});
		} else {
			callback(false);
		}
	});
};

module.exports = TravelAdministrationSystem;