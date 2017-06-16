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
var parentTravel;
var childTravel;
var seatAssignation;

describe('Changing travel status', function() {
  before(function(done) {
    sequelize.sync();
    travelTestResource.registerUsersAndTravels(function(users, travelResources) {
      students = users;
      studyTravels = travelResources;
      parentTravel = studyTravels[1];
      childTravel = studyTravels[0];
      travelAdministrationSystem.bookSeatWith(studyTravels[1].id, studyTravels[0].id,
        function(seatBookingSuccessful) {
          travelAdministrationSystem.activeSeatsForParentTravel(studyTravels[1].id,
            function(bookedSeats) {
              travelAdministrationSystem.confirmSeatBookingWith(bookedSeats[0].id,
                function(seatBookingSuccessful) {
                  done();
                });
            });
        });
    });
  });

  it('travels already created should have status "planed"', function() {
    assert.equal(studyTravels[0].status, 'planed');
    assert.equal(studyTravels[1].status, 'planed');
  });

  it('planed parent travel change status to "inProgress"', function(done) {
    travelAdministrationSystem.changeToInProgressTravel(studyTravels[1].id,
      function(isInProgress) {
        assert.equal(true, isInProgress);
        done();
      });
  });

  it('planed child travels change status to "inProgress" too', function(done) {
    childTravel.reload().then(function(travelRelouded) {
      assert.equal('inProgress', travelRelouded.status);
      done();
    });
  });

  it('in progress parent travel change status to "ended"', function(done) {
    travelAdministrationSystem.changeToEndedTravel(studyTravels[1].id,
      function(isEnded) {
        assert.equal(true, isEnded);
        travelAdministrationSystem.registerAllContactsFor(studyTravels[1].id);
        done();
      });
  });

  it('in progress child travels change status to "ended" too', function(done) {
    childTravel.reload().then(function(travelRelouded) {
      assert.equal('ended', travelRelouded.status);
      done();
    });
  });

  it('child travel users for ended parent travel', function(done) {
    travelAdministrationSystem.passengerIdsForEndedTravelIdentifiedBy(parentTravel.id,
      function(passengerIds) {
        assert.equal(passengerIds[0], childTravel.userId);
        done();
      });
  });

  after(function(done) {
    travelTestResource.destroy(function() {
      done();
    });
  });
});