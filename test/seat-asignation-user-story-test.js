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

describe('Seat asignation', function() {
  before(function(done) {
    sequelize.sync();
    travelTestResource.registerUsersAndTravels(function(users, travelResources) {
      students = users;
      studyTravels = travelResources;
      done();
    });
  });

  describe('Asignations', function() {

    it('should fail child travel book seat in parent travel', function(done) {
      travelAdministrationSystem.bookSeatWith(studyTravels[0].id, studyTravels[1].id,
        function(seatBookingSuccessful) {
          assert.equal(false, seatBookingSuccessful);
          done();
        });
    });

    it('should successful child travel book seat in parent travel', function(done) {
      travelAdministrationSystem.bookSeatWith(studyTravels[1].id, studyTravels[0].id,
        function(seatBookingSuccessful) {
          assert.equal(true, seatBookingSuccessful);
          done();
        });
    });

    /*
    it('should successful booking confirmation', function(done) {
      travelAdministrationSystem.bookSeatWith(studyTravels[1].id, studyTravels[0].id,
        function(seatBookingSuccessful) {
          assert.equal(true, seatBookingSuccessful);
          done();
        });
    });
  */

  });

  after(function(done) {
    travelTestResource.destroy(function() {
      done();
    });
  });



});