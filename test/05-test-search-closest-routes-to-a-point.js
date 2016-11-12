// Tengo que econtrar las rutas que tienen el destino determinado, a la hora de llegada determinada, y que pasan cerca del punto determinado.
// En este caso asumo que todas las rutas van al mismo destino, con la misma hora de llegada.

var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var routeSystem = require('../models/route')(sequelize);
var User = require('../models/user')(sequelize);

var closestRoute = {
	travelId: 1,
	origin: 'Belgrano 280, Bernal, Buenos Aires, Argentina',
	destination: 'Belgrano 380, Bernal, Buenos Aires, Argentina',
	polyline: {
		type: 'LineString',
		coordinates: [[-34.71275, -58.279360000000004], [-34.70375, -58.296440000000004]
		]
	},
	distance: 209,
	duration: '1 min',
	summary: 'Belgrano'
};

var mediumRoute = {
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

var farthestRoute = {
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

var point = {
	type: 'Point',
	coordinates: [-34.713770000000004, -58.288590000000006]
};

describe('Find closestRoute', function() {
	before(function(done) {
		routeSystem.create(closestRoute).then(function() {
			routeSystem.create(mediumRoute).then(function() {
				routeSystem.create(farthestRoute).then(function() {
					done();
				});
			});
		});
	});



	it('should return the closestRoute for a point', function(endingFunction) {

		sequelize.query('SELECT * FROM route WHERE ST_DWithin(polyline,ST_GeographyFromText(\'SRID=4326; POINT(-34.713770000000004 -58.288590000000006)\'), 400);',{model : routeSystem}).then(function(routes) {
			console.log(routes);
			console.log(routes[0].summary);
			assert.equal(routes[0].summary,'Belgrano');
			endingFunction();
}); /*
		routeSystem.findClosestRoutes(route).then(function(closestRoutes) {
			assert.equal(route.travelId, closestRoute[0].travelId);
			done();
		});
		*/
	});
	after(function(done) {
		routeSystem.destroy({
			truncate: true
		}).then(function() {
			done();
		});
	});
});