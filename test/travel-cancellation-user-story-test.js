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

describe('Parent Travel cancellation', function() {
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

  it('planed parent travel change status to "canceled"', function(done) {
    travelAdministrationSystem.changeToCanceledTravel(studyTravels[1].id,
      function(isCanceled) {
        assert.equal(true, isCanceled);
        done();
      });
  });

  it('planed child travels change status to "canceled" too', function(done) {
    childTravel.reload().then(function(travelRelouded) {
      assert.equal('canceled', travelRelouded.status);
      travelAdministrationSystem.seatAssignationForTravels(parentTravel.id, childTravel.id, function(seatAssignationFound) {
        assert.equal(seatAssignationFound.status, 'canceled');
        done();
      });
    });
  });

  after(function(done) {
    travelTestResource.destroy(function() {
      done();
    });
  });
});

describe('Child Travel cancellation', function() {
  before(function(done) {
    sequelize.sync();
    travelTestResource.registerUsersAndTravels(function(users, travelResources) {
      students = users;
      studyTravels = travelResources;
      parentTravel = studyTravels[1];
      childTravel = studyTravels[0];
      travelAdministrationSystem.bookSeatWith(studyTravels[1].id, studyTravels[0].id,
        function(seatBookingSuccessful) {
          //console.log('-------------------------------------------------');
          //console.log(seatBookingSuccessful);
          //console.log('-------------------------------------------------');
          travelAdministrationSystem.activeSeatsForParentTravel(studyTravels[1].id,
            function(bookedSeats) {
              travelAdministrationSystem.confirmSeatBookingWith(bookedSeats[0].id,
                function(seatBookingSuccessful) {
                  parentTravel.reload().then(function() {
                    done();
                  });
                });
            });
        });
    });
  });

  it('travels already created should have status "planed"', function() {
    assert.equal(studyTravels[0].status, 'planed');
    assert.equal(studyTravels[1].status, 'planed');
    assert.equal(parentTravel.maximumSeats, 3);
    assert.equal(parentTravel.availableSeats, 2);
  });

  it('planed child travel change status to "canceled"', function(done) {
    travelAdministrationSystem.changeToCanceledTravel(childTravel.id,
      function(isCanceled) {
        assert.isOk(isCanceled);
        childTravel.reload().then(function() {
          assert.equal(childTravel.status, 'canceled');
          done();
        });
      });
  });

  it('planed parent travels not change status for child travel cancellation.', function(done) {
    parentTravel.reload().then(function() {
      console.log(parentTravel);
      assert.equal('planed', parentTravel.status);
      assert.equal(parentTravel.maximumSeats, 3);
      assert.equal(parentTravel.availableSeats, 3);
      done();
    });
  });

  it('canceled child travel can not be acepted.', function(done) {
    travelAdministrationSystem.seatAssignationForTravels(parentTravel.id, childTravel.id, function(seatAssignationFound) {
      seatAssignation = seatAssignationFound;
      assert.isNotNull(seatAssignation);
      travelAdministrationSystem.confirmSeatBookingWith(seatAssignation.id,
        function(confirmationSuccessful) {
          assert.notOk(confirmationSuccessful);
          done();
        });
    });
  });

  it('canceled child travel can not be found in active seat assignations for parentTravel', function(done) {
    travelAdministrationSystem.activeSeatsForParentTravel(parentTravel.id, function(seatAssignations) {
      assert.equal(seatAssignations.length, 0);
      done();
    });
  });

  after(function(done) {
    travelTestResource.destroy(function() {
      done();
    });
  });
});