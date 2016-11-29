var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var Travel = require('../models/travel')(sequelize);
var TravelAdministrationSystem = require('../controllers/travel-administration-system');
var travelAdministrationSystem = new TravelAdministrationSystem(sequelize);
var createTravels = require('./createTravelsUsingSystem')(User, travelAdministrationSystem);
var students = [];
var studyTravels = [];

describe('Managing a travel', function() {
  before(function(done) {
    this.timeout(5000);
    sequelize.sync();
    createTravels(function(users, travels) {
      students = users;
      studyTravels = travels;
      done();
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
      this.timeout(5000);
      travelAdministrationSystem.routesForTravel(studyTravels[0], function(routes) {
        console.log(routes);
        assert.equal(routes[0].distance, 302);
        done();
      });
    });

    after(function(done) {
      travelAdministrationSystem.destroy(function() {
        User.destroy({
          truncate: false,
          where: {
            sex: 'Femenino'
          }
        }).then(function() {
          done();
        });
      });
    });

  });
});