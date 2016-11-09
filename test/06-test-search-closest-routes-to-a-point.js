// Tengo que econtrar las rutas que tienen el destino determinado, a la hora de llegada determinada, y que pasan cerca del punto determinado.
// En este caso asumo que todas las rutas van al mismo destino, con la misma hora de llegada.

var assert = require('chai').assert;
var Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://carpooling:carpooling@localhost:5432/carpooling');
var routeSystem = require('../models/route')(sequelize);

var closestRoute = {
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
				})
			})
		})
	})

});

it('should return the closestRoute for a point', function(done) {
	routeSystem.findClosestRoutes(route).then(function(closestRoutes) {
		assert.equal(route.travelId, closestRoute[0].travelId);
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
};