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
var studentId;
var parentTravel;
var childTravel;

describe('Calculating users statistics', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      studentId = users[0].id;
      parentTravel = {
        id: 1,
        userId: studentId,
        origin: "Plaza Italia, 1425 CABA",
        destination: "Casa Rosada, Balcarce 50, 1064 Buenos Aires",
        userIsDriver: true,
        carId: 1,
        maximumSeats: 3,
        availableSeats: 1,
        arrivalDateTime: "2016-10-21 14:05:06",
        observations: "Deseo compartir gastos."
      };
      childTravel = {
        id: 2,
        userId: studentId,
        origin: "Plaza Italia, 1425 CABA",
        destination: "Casa Rosada, Balcarce 50, 1064 Buenos Aires",
        userIsDriver: false,
        carId: null,
        maximumSeats: 0,
        availableSeats: 0,
        arrivalDateTime: "2016-10-21 14:05:06",
        observations: ""
      };
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

  var route = {
    travelId: 1,
    origin: 'Plaza Italia, 1425 CABA',
    destination: 'Casa Rosada, Balcarce 50, 1064 Buenos Aires',
    polyline: [],
    distance: 7000,
    duration: '20 mins',
    summary: 'Av. del Libertador'
  };

  it('For route', function(done) {

    // Factor de emisión promedio: 223 gr/km = 0,223 gr/m = 0,000223 kg/m
    // carbonFootPrint = 0,223 (gr/m) * 7000 m = 1561 gr = 1,561 kg
    // carbonFootPrint = 0,000223 kg/m * 7000 m = 1,561 kg.
    var routeStatistics = userStatisticsSystem.calculateStatisticsForRoute(route);
    assert.equal(routeStatistics.distance, 7);
    assert.equal(routeStatistics.carbonFootPrint, 1.561);
    done();
  });

  it('For travel with route', function(done) {
    var parentStatistics = userStatisticsSystem.calculateStatisticsForParentTravel(parentTravel, route);
    assert.equal(parentStatistics.distance, 7);
    assert.equal(parentStatistics.carbonFootPrint, 1.561);
    assert.equal(parentStatistics.passengers, 2);
    assert.equal(parentStatistics.savedCarbonFootPrint, 3.122);
    done();
  });

  it('Update user statistics with parentTravel and route', function(done) {
    userStatisticsSystem.updateUsingParentTravelAndRoute(parentTravel, route, function(err, userStatistics) {
      assert.isNull(err);
      assert.equal(userStatistics.passengerTravels, 0);
      assert.equal(userStatistics.driverTravels, 1);
      assert.equal(userStatistics.totalTravels, 1);
      assert.equal(userStatistics.distanceAsPassenger, 0);
      assert.equal(userStatistics.distanceAsDriver, 7);
      assert.equal(userStatistics.totalDistance, 7);
      assert.equal(userStatistics.passengersTransported, 2);
      assert.equal(userStatistics.driverCarbonFootprint, 1.561);
      assert.equal(userStatistics.driverSavedCarbonFootprint, 3.122);
      assert.equal(userStatistics.passengerSavedCarbonFootprint, 0);
      assert.equal(userStatistics.totalSavedCarbonFootprint, 3.122);
      done();
    });
  });

  it('Update user statistics with childTravel and route', function(done) {
      userStatisticsSystem.updateUsingChildTravelAndRoute(childTravel, route, function(err, userStatistics) {
        assert.isNull(err);
        assert.equal(userStatistics.passengerTravels, 1);
        assert.equal(userStatistics.driverTravels, 1);
        assert.equal(userStatistics.totalTravels, 2);
        assert.equal(userStatistics.distanceAsPassenger, 7);
        assert.equal(userStatistics.distanceAsDriver, 7);
        assert.equal(userStatistics.totalDistance, 14);
        assert.equal(userStatistics.passengersTransported, 2);
        assert.equal(userStatistics.driverCarbonFootprint, 1.561);
        assert.equal(userStatistics.driverSavedCarbonFootprint, 3.122);
        assert.equal(userStatistics.passengerSavedCarbonFootprint, 1.561);
        assert.equal(userStatistics.totalSavedCarbonFootprint, 4.683);
        done();
      });
    });

  after(function(done) {
    userTestResource.destroy(function() {
      done();
    });
  });

});