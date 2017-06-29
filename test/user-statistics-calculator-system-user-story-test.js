var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var UserStatisticsSystem = require('../controllers/user-statistics-calculator-system');
var userStatisticsSystem = new UserStatisticsSystem(sequelize);
var students = [];

describe('Calculating users statistics', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      done();
    });
  });

  it('Initialy Juana has her user statistics on zero', function(done) {
    userStatisticsSystem.userStatisticsForUserById(students[0].id,
      function(userStatistics) {
        assert.equal(userStatistics.passengerTravels, 0);
        assert.equal(userStatistics.driverTravels, 0);
        assert.equal(userStatistics.totalTravels, 0);
        assert.equal(userStatistics.distanceAsPassenger, 0);
        assert.equal(userStatistics.distanceAsDriver, 0);
        assert.equal(userStatistics.totalDistance, 0);
        assert.equal(userStatistics.passengersTransported, 0);
        assert.equal(userStatistics.driverCarbonFootprint, 0);
        assert.equal(userStatistics.driverSavedCarbonFootprint, 0);
        assert.equal(userStatistics.passengerSavedCarbonFootprint, 0);
        assert.equal(userStatistics.totalSavedCarbonFootprint, 0);
        done();
      });
  });

  after(function(done) {
    userTestResource.destroy(function() {
      done();
    });
  });

});