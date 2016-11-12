var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var routeSystem = require('../models/route')(sequelize);
var polyline = require('polyline');

var calculatedRoute = {
	travelId: 1,
	origin: 'Belgrano 280, Bernal, Buenos Aires, Argentina',
	destination: 'Belgrano 380, Bernal, Buenos Aires, Argentina',
	polyline: 'nxzrEvwubJgBdFmAhD',
	distance: 209,
	duration: '1 min',
	summary: 'Belgrano'
};

var expectedRoute = {
	travelId: 1,
	origin: 'Belgrano 280, Bernal, Buenos Aires, Argentina',
	destination: 'Belgrano 380, Bernal, Buenos Aires, Argentina',
	polyline: {
		type: 'LineString',
		coordinates: [
			[-34.71256, -58.2798],
			[-34.71204, -58.28095],
			[-34.71165, -58.2818]
		]
	},
	distance: 209,
	duration: '1 min',
	summary: 'Belgrano'
};

var routeWithLineStringFrom = function(route) {
	var decodedPolyline = polyline.decode(route.polyline);
	route.polyline = {
		type: 'LineString',
		coordinates: decodedPolyline
	};
	return route;
}

var route = routeWithLineStringFrom(calculatedRoute);;

describe('Calculating route with string polyline', function() {
	it('should return a route with a string array', function(done) {
		routeSystem.create(route).then(function(createdRoute) {
			route = createdRoute;
			assert.equal(route.travelId, expectedRoute.travelId);
			assert.equal(route.origin, expectedRoute.origin);
			assert.equal(route.destination, expectedRoute.destination);
			assert.equal(route.polyline.type, expectedRoute.polyline.type);
			assert.equal(route.distance, expectedRoute.distance);
			assert.equal(route.duration, expectedRoute.duration);
			assert.equal(route.summary, expectedRoute.summary);
			done();
		});
	});
	after(function(done) {
		routeSystem.destroy({
			truncate: true
		}).then(function() {
			done();
		});
	});
});