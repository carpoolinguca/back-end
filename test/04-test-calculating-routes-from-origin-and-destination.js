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
            observations: "De la biblio a la facu." 
};

describe('Calculating route from origin to destination', function(done){
	it('should return a route', function() {			
			routeCalculatorSystem.calculateForTravel(travel, function(calculatedRoutes){
			assert.equal(origin,calculatedRoutes[0].travelId)
			assert.equal(origin,calculatedRoutes[0].origin);
			assert.equal(destination,calculatedRoutes[0].destination);
			assert.equal('nxzrEvwubJgBdFmAhD',calculatedRoutes[0].polyline);
			done();
		});
	});
});
