var assert = require('chai').assert;
var RouteCalculatorSystem = require('../controllers/route-calculator-system.js');
var routeCalculatorSystem = new RouteCalculatorSystem();

var travel =
        {
          	id: 1,
            userid: 3,
            origin: 'Belgrano 280, Bernal, Buenos Aires, Argentina',
            destination: 'Belgrano 380, Bernal, Buenos Aires, Argentina',
            seats: 4,
            arrivalDateTime: "2016-10-21 14:05:06",
            observations: "Paseo por Bernal." 
};

var waitedRoute = 
		{
			travelid : travel.id,
			origin : travel.origin,
			destination : travel.destination,
			polyline : 'nxzrEvwubJgBdFmAhD',
			distance : 209,
			duration : '1 min',
			summary : 'Belgrano'
};

describe('Calculating route from origin to destination', function(done){
	it('should return a route', function() {			
			routeCalculatorSystem.calculateForTravel(travel, function(calculatedRoutes){
			assert.equal(waitedRoute.travelid,calculatedRoutes[0].travelid)
			assert.equal(waitedRoute.origin,calculatedRoutes[0].origin);
			assert.equal(waitedRoute.destination,calculatedRoutes[0].destination);
			assert.equal(waitedRoute.polyline,calculatedRoutes[0].polyline);
			assert.equal(waitedRoute.distance,calculatedRoutes[0].distance);
			assert.equal(waitedRoute.duration,calculatedRoutes[0].duration);
			assert.equal(waitedRoute.summary,calculatedRoutes[0].summary);
			done();
		});
	});
});
