const querystring = require('querystring');
const https = require('https');
const polyline = require('polyline');

function RouteCalculatorSystem() {

}

var routeWithLineStringFrom = function(route) {
	var decodedPolyline = polyline.decode(route.polyline);
	route.polyline = {
		type: 'LineString',
		coordinates: decodedPolyline
	};
	return route;
}

RouteCalculatorSystem.prototype.calculateForTravel = function(travel, callback) {

	var baseUrl = 'https://maps.googleapis.com/maps/api/directions/json?';
	var query = {
		origin: travel.origin,
		destination: travel.destination
	};
	var url = baseUrl + querystring.stringify(query);

	var body = '';
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
			callback(routes);
		});

	});

};

module.exports = RouteCalculatorSystem;