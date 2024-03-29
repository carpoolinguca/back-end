var RouteCalculatorSystem = require('../controllers/route-calculator-system.js');
var routeCalculatorSystem;
var ContactAdministrationSystem = require('../controllers/contact-administration-system.js');
var contactAdministrationSystem;
var CarSystem = require('../controllers/car-administration-system.js');
var carSystem;
var UserStatisticsSystem = require('../controllers/user-statistics-calculator-system.js');
var userStatisticsSystem;

var Sequelize;
var Travel;

function TravelAdministrationSystem(sequelize) {
	Travel = require('../models/travel')(sequelize);
	SeatAssignation = require('../models/seat-assignation')(sequelize);
	routeCalculatorSystem = new RouteCalculatorSystem(sequelize);
	contactSystem = new ContactAdministrationSystem(sequelize);
	carSystem = new CarSystem(sequelize);
	userStatisticsSystem = new UserStatisticsSystem(sequelize);
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
		},
		order: [
			['arrivalDateTime']
		]
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
	var queryString = 'SELECT t.id, t.origin, t.destination, t."arrivalDateTime", t.status AS "travelStatus", s.status AS "seatAssignationStatus", y.observations, y."userId" AS "driverId", d.name, d.lastname, r."drivingPoints", r.complaints, y."carId", ca.model, ca.color, ca."licensePlate", ca."hasAirConditioner" FROM travel as t INNER JOIN seat_assignation as s ON t.id = s."childTravel" INNER JOIN travel as y ON s."parentTravel" = y.id INNER JOIN "user" AS d ON y."userId" = d.id INNER JOIN reputation AS r ON r."userId"= d.id INNER JOIN car AS ca ON ca.id= y."carId" WHERE t."userIsDriver" = false AND t."userId" = $userId ORDER BY t."arrivalDateTime";';
	Sequelize.query(queryString, {
		bind: {
			userId: userId
		},
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
	SeatAssignation.destroy({
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
	var self = this;
	self.startManaging(travel, function(travelCreated) {
		routeCalculatorSystem.calculateAndStartManagingForTravel(travelCreated.dataValues, function(err) {
			if (err) {
				self.destroyWithoutRoutes(travelCreated, function() {
					callback(err);
				});
				return;
			}
			callback(null, travelCreated);
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

TravelAdministrationSystem.prototype.findClosestTravelsForTravel = function(travel, endFunction) {
	self = this;
	self.startManaging(travel, function(travelCreated) {
		var travelQueriedFormated = self.formatQueriedTravel(travelCreated);
		routeCalculatorSystem.calculateForTravel(travelCreated.dataValues, function(err, routes) {
			if (err) {
				console.error(err);
				endFunction({
					queryTravel: travelQueriedFormated,
					travelsFound: [],
					error: err
				});
				return;
			}
			if (routes.length > 0) {
				var lastCoordinate = routes[0].polyline.coordinates.length - 1;
				var querystring;
				var replacements;
				if (!travel.arrivalDateTime) {
					queryString = 'SELECT tr.id, tr.origin, tr.destination, tr."availableSeats", tr."availableSeats", tr."arrivalDateTime", tr.observations, tr.status, re."userId", re."drivingPoints", re."complaints", us.email, us.name, us.lastname, us.sex, us.ucaid, us.phone, tr."carId", ca.model, ca.color, ca."licensePlate", ca."hasAirConditioner" FROM reputation AS re INNER JOIN "user" AS us ON re."userId"=us.id  INNER JOIN travel AS tr ON us.id = tr."userId" INNER JOIN car AS ca ON ca.id = tr."carId" WHERE tr.id IN (select ro."travel_id" from route as ro where  ST_DWithin(ro.polyline,ST_GeographyFromText(\'SRID=4326; POINT(:xOrigin :yOrigin )\'), 1500) and ST_DWithin(ro.polyline,ST_GeographyFromText(\'SRID=4326; POINT(:xDestination :yDestination)\'), 1000) and ro."travel_id" IN (select id from travel where "userIsDriver"=\'t\' and "userId" != :userId and "availableSeats" > 0 and status=\'planed\')) AND tr.id NOT IN (SELECT "parentTravel" FROM seat_assignation where "childTravel" IN (SELECT id from travel where "userId" = :userId AND "userIsDriver"=\'f\')) ORDER BY tr."arrivalDateTime", re."drivingPoints" DESC, re.complaints;';
					replacements = {
						xOrigin: routes[0].polyline.coordinates[0][0],
						yOrigin: routes[0].polyline.coordinates[0][1],
						xDestination: routes[0].polyline.coordinates[lastCoordinate][0],
						yDestination: routes[0].polyline.coordinates[lastCoordinate][1],
						userId: travelCreated.userId
					};
				} else {
					queryString = 'SELECT tr.id, tr.origin, tr.destination, tr."availableSeats", tr."availableSeats", tr."arrivalDateTime", tr.observations, tr.status, re."userId", re."drivingPoints", re."complaints", us.email, us.name, us.lastname, us.sex, us.ucaid, us.phone, tr."carId", ca.model, ca.color, ca."licensePlate", ca."hasAirConditioner" FROM reputation AS re INNER JOIN "user" AS us ON re."userId"=us.id  INNER JOIN travel AS tr ON us.id = tr."userId" INNER JOIN car AS ca ON ca.id = tr."carId" WHERE tr.id IN (select ro."travel_id" from route as ro where  ST_DWithin(ro.polyline,ST_GeographyFromText(\'SRID=4326; POINT(:xOrigin :yOrigin )\'), 1500) and ST_DWithin(ro.polyline,ST_GeographyFromText(\'SRID=4326; POINT(:xDestination :yDestination)\'), 1000) and ro."travel_id" IN (select id from travel where "userIsDriver"=\'t\' and "userId" != :userId and "availableSeats" > 0 and status=\'planed\' and "arrivalDateTime"::date = :arrivalDateTime ::date)) AND tr.id NOT IN (SELECT "parentTravel" FROM seat_assignation where "childTravel" IN (SELECT id from travel where "userId" = :userId AND "userIsDriver"=\'f\')) ORDER BY tr."arrivalDateTime", re."drivingPoints" DESC, re.complaints;';
					replacements = {
						xOrigin: routes[0].polyline.coordinates[0][0],
						yOrigin: routes[0].polyline.coordinates[0][1],
						xDestination: routes[0].polyline.coordinates[lastCoordinate][0],
						yDestination: routes[0].polyline.coordinates[lastCoordinate][1],
						userId: travelCreated.userId,
						arrivalDateTime: travelCreated.arrivalDateTime
					};
				}

				Sequelize.query(queryString, {
					replacements: replacements,
					type: Sequelize.QueryTypes.SELECT
				}).then(function(results) {
					console.log(results);
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
	SeatAssignation.findById(assignationId).then(
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

TravelAdministrationSystem.prototype.seatAssignationForTravels = function(parentTravelId, childTravelId, callback) {
	SeatAssignation.findOne({
		where: {
			childTravel: childTravelId,
			parentTravel: parentTravelId
		}
	}).then(function(seatAssignationFound) {
		callback(seatAssignationFound);
	});
};

TravelAdministrationSystem.prototype.confirmSeatBookingWith = function(assignationId, callback) {
	SeatAssignation.findById(assignationId).then(
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

TravelAdministrationSystem.prototype.updateArrivalDatetimeInChildTravel = function(parentTravel, childTravelId, callback) {
	Travel.findById(childTravelId).then(function(childTravel) {
		childTravel.arrivalDateTime = parentTravel.arrivalDateTime;
		childTravel.save().then(function() {
			childTravel.reload().then(function() {
				callback(childTravel);
			});
		});
	});
};

TravelAdministrationSystem.prototype.userHasAlreadyBookedParentTravel = function(parentTravelId, childTravelId, callback) {
	var queryString = 'SELECT * FROM seat_assignation WHERE "parentTravel" = $parentTravelId AND "childTravel" IN (SELECT id FROM travel WHERE "userId" = ANY (SELECT "userId" FROM travel where id = $childTravelId )); ';
	Sequelize.query(queryString, {
		bind: {
			parentTravelId: parentTravelId,
			childTravelId: childTravelId
		},
		type: Sequelize.QueryTypes.RAW
	}).then(function(results) {
		callback(results[0].length > 0);
	});
};

TravelAdministrationSystem.prototype.bookSeatWith = function(parentTravelId, childTravelId, callback) {
	var self = this;
	self.userHasAlreadyBookedParentTravel(parentTravelId, childTravelId, function(alreadyBooked) {
		if (alreadyBooked) {
			callback({
				booked: false,
				error: 'El pasajero ya ha reservado un asiento en este viaje. No esta permitido reservar otro.'
			});
		} else {
			Travel.findById(parentTravelId).then(function(parentTravel) {
				if (parentTravel.userIsDriver) {
					console.log(parentTravel);
					if (parentTravel.availableSeats > 0) {
						parentTravel.decrement('availableSeats');
						SeatAssignation.create({
							parentTravel: parentTravelId,
							childTravel: childTravelId,
							status: 'pending'
						}).then(function(assignationCreated) {
							self.updateArrivalDatetimeInChildTravel(parentTravel, childTravelId, function(updatedChildTravel) {
								callback({
									assignationCreated: assignationCreated,
									booked: true,
									travel: updatedChildTravel,
									error: ''
								});
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
		}
	});
};

TravelAdministrationSystem.prototype.activeSeatsForParentTravel = function(parentTravelId, callback) {
	var queryString = 'SELECT s.id, s.status, s."parentTravel", s."childTravel", t.origin, t.destination, t."userId", u.name, u.lastname, u.email, r."passengerPoints", r.complaints FROM seat_assignation AS s INNER JOIN travel AS t ON (s."childTravel"=t.id) INNER JOIN "user" AS u ON (t."userId"=u.id) INNER JOIN reputation AS r ON (u.id=r."userId") WHERE s."parentTravel" = $parentTravelId AND s.status != \'canceled\' ;';
	Sequelize.query(queryString, {
		bind: {
			parentTravelId: parentTravelId
		},
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
	var queryString = 'UPDATE "travel" SET "status"= $status::varchar WHERE "id"  IN (SELECT "childTravel" FROM "seat_assignation" WHERE "parentTravel"= $parentTravelId AND "status"=\'booked\' ) ;';
	Sequelize.query(queryString, {
		bind: {
			status: status,
			parentTravelId: parentTravelId,
		}
	}).then(function(results) {
		callback(true);
	});
};

TravelAdministrationSystem.prototype.cancelChildTravelSeatAssignationsRelatedTo = function(parentTravelId, callback) {
	var queryString = 'UPDATE seat_assignation SET "status"=\'canceled\' WHERE "parentTravel" = $parentTravelId AND "status"<>\'rejected\';';
	Sequelize.query(queryString, {
		bind: {
			parentTravelId: parentTravelId,
		}
	}).then(function(results) {
		callback();
	});
};

TravelAdministrationSystem.prototype.childTravelsFor = function(parentTravel, callback){
	var identifications = [];
	SeatAssignation.findAll(
		{where : {parentTravel : parentTravel.id, status: 'booked'}, attributes : ['childTravel']}).then(function(ids){
			ids.forEach(function(childTravel, index, arr) {
			identifications.push(childTravel.id);
		});
		Travel.findAll({where: {id: {$in: identifications}}}).then(function(childTravels){
			callback(childTravels);
		});
	});
};

TravelAdministrationSystem.prototype.passengerIdsForEndedTravelIdentifiedBy = function(parentTravelId, callback) {
	var queryString = 'SELECT "userId" FROM travel WHERE "id"  IN (SELECT "childTravel" FROM "seat_assignation" WHERE "parentTravel"= $parentTravelId AND "status"=\'booked\' ) ;';
	Sequelize.query(queryString, {
		bind: {
			parentTravelId: parentTravelId
		},
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
		Travel.findById(parentTravelId).then(function(parentTravel) {
			routeCalculatorSystem.routesForTravel(parentTravel, function(routes){
				if(routes.length > 0)
				userStatisticsSystem.updateUsingParentTravelAndRoute(parentTravel, routes[0], function(userStatistics){});
			});	
		});
		self.changeStatusToChildTravelsRelatedTo(parentTravelId, 'ended', condition, function(successfull) {
			self.registerAllContactsFor(parentTravelId);
			callback(successfull);
		});
	}, function() {
		callback(false);
	});
};

TravelAdministrationSystem.prototype.changeToCanceledTravel = function(travelId, callback) {
	var self = this;
	var condition = function(travel) {
		return (travel.status != 'ended');
	};
	self.changeToStatusSatisfayingCondition(travelId, 'canceled', condition, function() {
		self.changeStatusToChildTravelsRelatedTo(travelId, 'canceled', condition, function(successfull) {
			SeatAssignation.findOne({
				where: {
					childTravel: travelId
				}
			}).then(function(seatFound) {
				if (seatFound !== null) {
					Travel.findById(seatFound.parentTravel).then(function(travelFound) {
						travelFound.increment('availableSeats').then(function() {
							seatFound.status = 'canceled';
							seatFound.save().then(function() {
								callback(successfull);
							});
						});
					});
				} else {
					self.cancelChildTravelSeatAssignationsRelatedTo(travelId, function() {
						callback(successfull);
					});
				}
			});
		});
	}, function() {
		callback(false);
	});
};

TravelAdministrationSystem.prototype.seatIdentifiedBy = function(seatId, foundCallback, notFoundCallback) {
	SeatAssignation.findById(seatId).then(function(foundSeat) {
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

TravelAdministrationSystem.prototype.unregisterCar = function(carId, callback) {
	Travel.findOne({
		where: {
			carId: carId
		}
	}).then(function(foundTravel) {
		if (!foundTravel) {
			carSystem.unregister(carId, function() {
				callback(null);
			});
		} else {
			callback(new Error('No se puede eliminar auto, tiene viajes relacionados.'));
		}
	});
};

module.exports = TravelAdministrationSystem;