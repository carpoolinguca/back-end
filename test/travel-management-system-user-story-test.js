var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var Travel = require('../models/travel')(sequelize);
var TravelAdministrationSystem = require('../controllers/travel-administration-system');
var travelAdministrationSystem = new TravelAdministrationSystem(sequelize);
var TravelTestResource = require('./travel-test-resource');
var travelTestResource = new TravelTestResource(userAdministrationSystem, travelAdministrationSystem);
var students = [];
var studyTravels = [];
var route;

describe('Managing a travel', function() {
  before(function(done) {
    sequelize.sync();
    travelTestResource.registerUsersAndTravels(function(users, travelResources) {
      students = users;
      studyTravels = travelResources;
      parentTravel = studyTravels[1];
      childTravel = studyTravels[0];
      travelAdministrationSystem.startManagingOfflineRoute({
        travelId: parentTravel.id,
        origin: parentTravel.origin,
        destination: parentTravel.destination,
        polyline: {
          type: 'LineString',
          coordinates: [
            [38.5, -120.2],
            [40.7, -120.95],
            [43.252, -126.453]
          ]
        },
        distance: 300,
        duration: '5 min',
        summary: 'Alicia Moreau de Justo'
      }, function(registeredRoute) {
        route = registeredRoute;
        done();
      });
    });
  });

  describe('#findAll()', function() {

    it('should find without error', function(done) {
      travelAdministrationSystem.travelsFilteredBy({
        where: {
          id: studyTravels[0].id
        }
      }, function(readTravels) {
        assert.equal(readTravels[0].observations, "De la biblio a la facu.");
        done();
      });
    });

    it('should find a route for travel', function(done) {
      travelAdministrationSystem.routesForTravel(parentTravel, function(routes) {
        assert.equal(routes[0].distance, 300);
        done();
      });
    });

    after(function(done) {
      travelTestResource.destroy(function() {
        done();
      });
    });

  });
});