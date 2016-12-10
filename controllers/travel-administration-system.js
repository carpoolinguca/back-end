var RouteCalculatorSystem = require('../controllers/route-calculator-system.js');
var routeCalculatorSystem;

var Sequelize;
var Travel;

function TravelAdministrationSystem(sequelize) {
	Travel = require('../models/travel')(sequelize);
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

TravelAdministrationSystem.prototype.startManaging = function(travel, callback) {
	Travel.create(travel).then(function(travelCreated) {
		callback(travelCreated);
	});
};

TravelAdministrationSystem.prototype.startManagingAndCalculateRoutes = function(travel, callback) {
	Travel.create(travel).then(function(travelCreated) {
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
	Travel.create(travel).then(function(travelCreated) {
		routeCalculatorSystem.calculateForTravel(travelCreated.dataValues, function(routes) {
			var queryString = 'select * from travel where id in (select ro.travel_id from route as ro where  ST_DWithin(ro.polyline,ST_GeographyFromText(\'SRID=4326; POINT(' + routes[0].polyline.coordinates[0][0] + ' ' + routes[0].polyline.coordinates[0][1] + ' )\'), 1000) and ro.travel_id IN (select id from travel where "userIsDriver"=\'t\' and "userId" != ' + travelCreated.userId  +' and seats > 0 and destination = \'' + travelCreated.destination + '\'));';
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

module.exports = TravelAdministrationSystem;