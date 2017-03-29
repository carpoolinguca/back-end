var RouteCalculatorSystem = require('../controllers/route-calculator-system.js');
var routeCalculatorSystem;
var ContactAdministrationSystem = require('../controllers/contact-administration-system.js');
var contactAdministrationSystem;


var Sequelize;
var Travel;

function TravelAdministrationSystem(sequelize) {
	Travel = require('../models/travel')(sequelize);
	SeatAsignation = require('../models/seat-assignation')(sequelize);
	routeCalculatorSystem = new RouteCalculatorSystem(sequelize);
	contactAdministrationSystem = new ContactAdministrationSystem(sequelize);
	Sequelize = sequelize;
}


TravelAdministrationSystem.prototype.travelsFilteredBy = function(parameters, callback) {
	Travel.findAll(parameters).then(function(travels) {
		callback(travels);
	});
};

TravelAdministrationSystem.prototype.travelsForUserIdentifiedBy = function(userId, callback) {
	this.travelsFilteredBy({
		where: {
			userId: userId
		}
	}, callback);
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
			var queryString = 'SELECT * FROM reputation AS re INNER JOIN "user" AS us ON re."userId"=us.id  INNER JOIN travel AS tr ON us.id = tr."userId" WHERE tr.id in (select ro."travel_id" from route as ro where  ST_DWithin(ro.polyline,ST_GeographyFromText(\'SRID=4326; POINT(' + routes[0].polyline.coordinates[0][0] + ' ' + routes[0].polyline.coordinates[0][1] + ' )\'), 1000) and ro."travel_id" IN (select id from travel where "userIsDriver"=\'t\' and "userId" != ' + travelCreated.userId + ' and "availableSeats" > 0 and destination = \'' + travelCreated.destination + '\'));';
			Sequelize.query(queryString, {
				type: Sequelize.QueryTypes.SELECT
			}).then(function(results) {
				endFunction({
					queryTravel: travelCreated,
					travelsFound: results
				});
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
						parentTravel.increment('availableSeats');
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
			}).then(function(assignationCreated) {
				callback({
					assignationCreated: assignationCreated,
					booked: true,
					error: ''
				});
			});
		} else {
			callback({
				booked: false,
				error: 'No quedan más asientos disponibles.'
			});
		}
	});
};

TravelAdministrationSystem.prototype.seatsForParentTravel = function(parentTravelId, callback) {
	var queryString = 'SELECT s.id, s.status, s."parentTravel", s."childTravel", t.origin, t.destination, t."userId", u.name, u.lastname, u.email, r."passengerPoints", r.complaints FROM seat_assignation AS s INNER JOIN travel AS t ON (s."childTravel"=t.id) INNER JOIN "user" AS u ON (t."userId"=u.id) INNER JOIN reputation AS r ON (u.id=r."userId") WHERE s."parentTravel" = ' + parentTravelId + ' ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
	});
};

TravelAdministrationSystem.prototype.changeToInProgressTravel = function(parentTravelId, callback) {
	var self = this;
	var condition = function(travel) {
		return (travel.status == 'planed' || travel.status == 'inProgress');
	};
	self.changeToStatusSatisfayingCondition(parentTravelId, 'inProgress', condition, function() {
		self.changeStatusToChildTravelsRelatedTo(parentTravelId, 'inProgress', condition, function(successfull) {
			callback(successfull);
		});
	}, function() {
		callback(false);
	});
};

TravelAdministrationSystem.prototype.changeToStatusSatisfayingCondition = function(travelId, status, condition, successfullCallback, unsuccessfullCallback) {
	Travel.findById(travelId).then(function(travel) {
		if (condition(travel)) {
			travel.update({
				status: status
			}).then(function() {
				successfullCallback();
			});
		} else {
			unsuccessfullCallback();
		}
	});
};

TravelAdministrationSystem.prototype.changeStatusToChildTravelsRelatedTo = function(parentTravelId, status, condition, callback) {
	// Sólo me interesa cambiar el estado de los viajes hijos que fueron confirmados por el conductor, por eso busco en estado 'booked'
	var queryString = 'UPDATE "travel" SET "status"=\'' + status + '\' WHERE "id"  IN (SELECT "childTravel" FROM "seat_assignation" WHERE "parentTravel"=' + parentTravelId + ' AND "status"=\'booked\' ) ;';
	Sequelize.query(queryString).then(function(results) {
		callback(true);
	});
};

TravelAdministrationSystem.prototype.changeToEndedTravel = function(parentTravelId, callback) {
	var self = this;
	var condition = function(travel) {
		return (travel.status == 'inProgress' || travel.status == 'ended');
	};
	self.changeToStatusSatisfayingCondition(parentTravelId, 'ended', condition, function() {
		self.changeStatusToChildTravelsRelatedTo(parentTravelId, 'ended', condition, function(successfull) {
			callback(successfull);
		});
	}, function() {
		callback(false);
	});
};

TravelAdministrationSystem.prototype.changeToCanceledTravel = function(parentTravelId, callback) {
	var self = this;
	var condition = function(travel) {
		return (travel.status != 'ended');
	};
	self.changeToStatusSatisfayingCondition(parentTravelId, 'canceled', condition, function() {
		self.changeStatusToChildTravelsRelatedTo(parentTravelId, 'canceled', condition, function(successfull) {
			callback(successfull);
		});
	}, function() {
		callback(false);
	});
};

TravelAdministrationSystem.prototype.seatIdentifiedBy = function(seatId, foundCallback, notFoundCallback) {
	SeatAsignation.findById(seatId).then(function(foundSeat) {
		if (foundSeat !== null) {
			foundCallback(foundSeat);
		} else {
			notFoundCallback('No se ha encontrado un asiento con ese id');
		}
	});
};

module.exports = TravelAdministrationSystem;