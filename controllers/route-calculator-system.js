const querystring = require('querystring');
const https = require('https');
const polyline = require('polyline');
var Sequelize;
var Route;

function RouteCalculatorSystem(sequelize) {
	Route = require('../models/route')(sequelize);
	Sequelize = sequelize;
}

var lineStringFrom = function(encodedPolyline) {
	var decodedPolyline = polyline.decode(encodedPolyline);
	return {
		type: 'LineString',
		coordinates: decodedPolyline
	};
};

RouteCalculatorSystem.prototype.calculateForTravel = function(travel, callback) {

	var baseUrl = 'https://maps.googleapis.com/maps/api/directions/json?';
	var query = {
		origin: travel.origin,
		destination: travel.destination
	};
	var url = baseUrl + querystring.stringify(query);
	var body = '';
	//Mejorar este código para evitar responses repetidos
	https.get(url, (response) => {
		response.setEncoding('utf8');
		response.on('data', (chunk) => {
			body += chunk;
		});
		response.on('end', () => {
			var routes = [];
			var jsonResponse = JSON.parse(body);
			if (jsonResponse.status == 'OK') {
				jsonResponse.routes.forEach(function(currentValue, index, arr) {
					var polyline = lineStringFrom(currentValue.overview_polyline.points);
					var distance = currentValue.legs[0].distance.value;
					var duration = currentValue.legs[0].duration.text;
					routes[index] = {
						travelId: travel.id,
						origin: travel.origin,
						destination: travel.destination,
						polyline: polyline,
						distance: distance,
						duration: duration,
						summary: currentValue.summary
					};
				});
			};
			callback(null, routes);
		});
	}).on('error', (e) => {
		callback(e);
	});
};

RouteCalculatorSystem.prototype.calculateAndStartManagingForTravel = function(travel, callback) {
	this.calculateForTravel(travel, function(err, routes) {
		if(err){
			callback(err);
			return;
		}
		Route.bulkCreate(routes).then(function() {
			callback(err, routes);
		});
	});
};

RouteCalculatorSystem.prototype.startManagingOfflineRoute = function(route, callback) {
	Route.create(route).then(callback);
};

RouteCalculatorSystem.prototype.destroy = function(callback) {
	Route.destroy({
		truncate: true
	}).then(function() {
		callback();
	});
};

RouteCalculatorSystem.prototype.countAll = function(endingFunction) {
	Route.findAll({
		attributes: [
			[Sequelize.fn('COUNT', Sequelize.col('id')), 'id_count']
		]
	}).then(function(results) {
		endingFunction(results[0].get('id_count'));
	});
};

RouteCalculatorSystem.prototype.routesForTravel = function(travel, endingFunction) {
	Route.findAll({
		where: {
			travelId: travel.id
		}
	}).then(function(routes) {
		endingFunction(routes);
	});
};

module.exports = RouteCalculatorSystem;