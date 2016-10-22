const querystring = require('querystring');
const https = require('https');

function RouteCalculatorSystem() {

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
			jsonResponse.routes.forEach(function (currentValue, index, arr){
				var polyline = currentValue.overview_polyline.points;
				var route = {
					travelid : travel.id,
					origin : travel.origin,
					destination: travel.destination,
					polyline : polyline};
				routes[index] = route;
			});
			callback(routes);
		});

	});

};

module.exports = RouteCalculatorSystem;