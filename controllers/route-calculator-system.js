const querystring = require('querystring');
const https = require('https');
const polyline = require('polyline');
var Sequelize;
var Route;

function RouteCalculatorSystem(sequelize) {
	Route = require('../models/route')(sequelize);
	Sequelize = sequelize;
}

var routeWithLineStringFrom = function(route) {
	var decodedPolyline = polyline.decode(route.polyline);
	route.polyline = {
		type: 'LineString',
		coordinates: decodedPolyline
	};
	return route;
}

var createRecursive = function(routes, createdRoutes, callback) {
	if (routes.length = 0) {
		callback(createdRoutes);
	} else {
		Route.create(routes.pop).then(function(createdRoute) {
			createdRoutes.push(createdRoute);
			createRecursive(routes, createdRoutes, callback);
		});
	}
}

var createAllRoutes = function(routes, callback) {
	if(routes.length > 0 && routes.length <4){
		createRecursive(routes, [], callback);
	}
	else
	{
		callback([]);
	}
}

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
			var jsonResponse = JSON.parse(body);
			var routes = [];
			jsonResponse.routes.forEach(function(currentValue, index, arr) {
				var polyline = currentValue.overview_polyline.points;
				var distance = currentValue.legs[0].distance.value;
				var duration = currentValue.legs[0].duration.text;
				var route = {
					travelid: travel.id,
					origin: travel.origin,
					destination: travel.destination,
					polyline: polyline,
					distance: distance,
					duration: duration,
					summary: currentValue.summary
				};
				routes[index] = routeWithLineStringFrom(route);
			});
			createAllRoutes(routes, callback);
		});

	});

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

module.exports = RouteCalculatorSystem;