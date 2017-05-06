var RouteCalculatorSystem = require('../controllers/route-calculator-system.js');
var routeCalculatorSystem;
var ContactAdministrationSystem = require('../controllers/contact-administration-system.js');
var contactAdministrationSystem;
var CarSystem = require('../controllers/car-administration-system.js');
var carSystem;

var Sequelize;
var Travel;

function TravelAdministrationSystem(sequelize) {
	Travel = require('../models/travel')(sequelize);
	SeatAsignation = require('../models/seat-assignation')(sequelize);
	routeCalculatorSystem = new RouteCalculatorSystem(sequelize);
	contactSystem = new ContactAdministrationSystem(sequelize);
	carSystem = new CarSystem(sequelize);
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

TravelAdministrationSystem.prototype.travelsForDriverIdentifiedBy = function(userId, callback) {
	this.travelsFilteredBy({
		attributes: ['id', 'origin', 'destination', 'arrivalDateTime', 'status', 'maximumSeats', 'availableSeats', 'carId', 'observations'],
		where: {
			userId: userId,
			userIsDriver: true
		}
	}, callback);
};

TravelAdministrationSystem.prototype.formatTravelsForPassenger = function(travels) {
	var formatedTravels = [];
	travels.forEach(function(travel, index, arr) {
		formatedTravels.push({
			id: travel.id,
			origin: travel.origin,
			destination: travel.destination,
			arrivalDateTime: travel.arrivalDateTime,
			status: travel.travelStatus,
			seatAssignationStatus: travel.seatAssignationStatus,
			observations: travel.observations,
			driver: {
				userId: travel.driverId,
				name: travel.name,
				lastname: travel.lastname,
				drivingPoints: travel.drivingPoints,
				complaints: travel.complaints
			},
			car: {
				id: travel.carId,
				model: travel.model,
				color: travel.color,
				licensePlate: travel.licensePlate,
				hasAirConditioner: travel.hasAirConditioner
			}
		});
	});
	return formatedTravels;
};

TravelAdministrationSystem.prototype.travelsForPassengerIdentifiedBy = function(userId, callback) {
	var self = this;
	var queryString = 'SELECT t.id, t.origin, t.destination, t."arrivalDateTime", t.status AS "travelStatus", s.status AS "seatAssignationStatus", y.observations, y."userId" AS "driverId", d.name, d.lastname, r."drivingPoints", r.complaints, y."carId", ca.model, ca.color, ca."licensePlate", ca."hasAirConditioner" FROM travel as t INNER JOIN seat_assignation as s ON t.id = s."childTravel" INNER JOIN travel as y ON s."parentTravel" = y.id INNER JOIN "user" AS d ON y."userId" = d.id INNER JOIN reputation AS r ON r."userId"= d.id INNER JOIN car AS ca ON ca.id= y."carId" WHERE t."userIsDriver" = false AND t."userId" = ' + userId + ' ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(self.formatTravelsForPassenger(results));
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
		carId: travel.carId,
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
		routeCalculatorSystem.calculateAndStartManagingForTravel(travelCreated.dataValues, function() {
			callback(travelCreated.dataValues);
		});
	});
};

TravelAdministrationSystem.prototype.findAll = function(endFunction) {
	Travel.findAll().then(function(results) {
		endFunction(results);
	});
};

TravelAdministrationSystem.prototype.formatFoundTravels = function(travels) {
	var formatedTravels = [];
	travels.forEach(function(travel, index, arr) {
		formatedTravels.push({
			id: travel.id,
			origin: travel.origin,
			destination: travel.destination,
			arrivalDateTime: travel.arrivalDateTime,
			status: travel.travelStatus,
			observations: travel.observations,
			compatibility: "Se deja los datos de usuario desencapsulados para compatibilidad con versiones anteriores de la app. Quitar esto cuando ya no se use",
			userId: travel.userId,
			drivingPoints: travel.drivingPoints,
			complaints: travel.complaints,
			email: travel.email,
			name: travel.name,
			lastname: travel.lastname,
			sex: travel.sex,
			ucaid: travel.ucaid,
			phone: travel.phone,
			driver: {
				userId: travel.userId,
				name: travel.name,
				lastname: travel.lastname,
				email: travel.email,
				sex: travel.sex,
				ucaid: travel.ucaid,
				phone: travel.phone,
				drivingPoints: travel.drivingPoints,
				complaints: travel.complaints
			},
			car: {
				id: travel.carId,
				model: travel.model,
				color: travel.color,
				licensePlate: travel.licensePlate,
				hasAirConditioner: travel.hasAirConditioner
			}
		});
	});
	return formatedTravels;
};

TravelAdministrationSystem.prototype.formatQueriedTravel = function(travel) {
	return {
		id: travel.id,
		userId: travel.userId,
		origin: travel.origin,
		destination: travel.destination,
		arrivalDateTime: travel.arrivalDateTime,
		status: travel.travelStatus,
		observations: travel.observations
	};
};

//TODO: agregar filtrado por día de la fecha!
TravelAdministrationSystem.prototype.findClosestTravelsForTravel = function(travel, endFunction) {
	self = this;
	self.startManaging(travel, function(travelCreated) {
		var travelQueriedFormated = self.formatQueriedTravel(travelCreated);
		routeCalculatorSystem.calculateForTravel(travelCreated.dataValues, function(routes) {
			if (routes.length > 0) {
				var lastCoordinate = routes[0].polyline.coordinates.length - 1;
				var queryString = 'SELECT tr.id, tr.origin, tr.destination, tr."availableSeats", tr."availableSeats", tr."arrivalDateTime", tr.observations, tr.status, re."userId", re."drivingPoints", re."complaints", us.email, us.name, us.lastname, us.sex, us.ucaid, us.phone, tr."carId", ca.model, ca.color, ca."licensePlate", ca."hasAirConditioner" FROM reputation AS re INNER JOIN "user" AS us ON re."userId"=us.id  INNER JOIN travel AS tr ON us.id = tr."userId" INNER JOIN car AS ca ON ca.id = tr."carId" WHERE tr.id in (select ro."travel_id" from route as ro where  ST_DWithin(ro.polyline,ST_GeographyFromText(\'SRID=4326; POINT(' + routes[0].polyline.coordinates[0][0] + ' ' + routes[0].polyline.coordinates[0][1] + ' )\'), 1000) and ST_DWithin(ro.polyline,ST_GeographyFromText(\'SRID=4326; POINT(' + routes[0].polyline.coordinates[lastCoordinate][0] + ' ' + routes[0].polyline.coordinates[lastCoordinate][1] + ' )\'), 500) and ro."travel_id" IN (select id from travel where "userIsDriver"=\'t\' and "userId" != ' + travelCreated.userId + ' and "availableSeats" > 0 ));';
				Sequelize.query(queryString, {
					type: Sequelize.QueryTypes.SELECT
				}).then(function(results) {
					var formatedTravels = self.formatFoundTravels(results);
					endFunction({
						queryTravel: travelQueriedFormated,
						travelsFound: formatedTravels
					});
				});
			} else {
				endFunction({
					queryTravel: travelQueriedFormated,
					travelsFound: []
				});
			}
		});
	});
};

TravelAdministrationSystem.prototype.startManagingOfflineRoute = function(route, callback) {
	routeCalculatorSystem.startManagingOfflineRoute(route, function(routes) {
		callback(routes);
	});
};

TravelAdministrationSystem.prototype.routesForTravel = function(travel, callback) {
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
		if(parentTravel.userIsDriver){
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
	} else {
		callback({
				booked: false,
				error: 'No se le puede reservar un asiento a un viaje de pasajero.'
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

TravelAdministrationSystem.prototype.passengerIdsForEndedTravelIdentifiedBy = function(parentTravelId, callback) {
	var queryString = 'SELECT "userId" FROM travel WHERE "id"  IN (SELECT "childTravel" FROM "seat_assignation" WHERE "parentTravel"=' + parentTravelId + ' AND "status"=\'booked\' ) ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		var passengerIds = [];
		results.forEach(function(result, index, arr) {
			passengerIds.push(result.userId);
		});
		callback(passengerIds);
	});
};

TravelAdministrationSystem.prototype.registerAllContactsFor = function(parentTravelId) {
	this.passengerIdsForEndedTravelIdentifiedBy(parentTravelId, function(passengerIds) {
		Travel.findById(parentTravelId).then(function(parentTravel) {
			contactSystem.registerAllContactsWith(parentTravel.userId, passengerIds, function() {});
		});
	});
};

TravelAdministrationSystem.prototype.changeToEndedTravel = function(parentTravelId, callback) {
	var self = this;
	var condition = function(travel) {
		return (travel.status == 'inProgress' || travel.status == 'ended');
	};
	self.changeToStatusSatisfayingCondition(parentTravelId, 'ended', condition, function() {
		self.changeStatusToChildTravelsRelatedTo(parentTravelId, 'ended', condition, function(successfull) {
			self.registerAllContactsFor(parentTravelId);
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

TravelAdministrationSystem.prototype.updateCarForTravelById = function(travelId, carId, callback) {
	Travel.findById(travelId).then(function(foundTravel) {
		if (!foundTravel) {
			callback(new Error('No se ha encontrado un viaje para el id:' + travelId));
			return;
		}
		carSystem.findById(carId, function(err, foundCar) {
			if (err) {
				callback(err);
				return;
			}
			foundTravel.carId = carId;
			foundTravel.save().then(function() {
				foundTravel.reload().then(function() {
					callback(null, foundTravel);
				});
			});
		});
	});
};

module.exports = TravelAdministrationSystem;