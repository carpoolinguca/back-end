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
var seatAssignation;

describe('Seat assignation', function() {
  before(function(done) {
    sequelize.sync();
    travelTestResource.registerUsersAndTravels(function(users, travelResources) {
      students = users;
      studyTravels = travelResources;
      done();
    });
  });

  describe('Assignations', function() {

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

    it('parent travel should has one seats booked with pending confirmation', function(done) {
      travelAdministrationSystem.seatsForParentTravel(studyTravels[1].id,
        function(bookedSeats) {
          console.log(bookedSeats);
          seatAssignation = bookedSeats[0];
          assert.equal(1, bookedSeats.length);
          assert.equal(studyTravels[1].id, seatAssignation.parentTravel);
          assert.equal('pending', seatAssignation.status);
          done();
        });
    });

    it('should successful confirm seat booking', function(done) {
      console.log(seatAssignation);
      travelAdministrationSystem.confirmSeatBookingWith(seatAssignation.id,
        function(seatBookingSuccessful) {
          assert.equal(true, seatBookingSuccessful);
          done();
        });
    });

    it('status query for the seat already confirmed should be confirmed', function(done) {
      travelAdministrationSystem.seatIdentifiedBy(seatAssignation.id, function(seat) {
        assert.equal('booked', seat.status);
        done();
      }, function(error) {
        assert.fail('','',error);
      });
    });

    it('parent travel should has one seats booked confirmed', function(done) {
      travelAdministrationSystem.seatsForParentTravel(studyTravels[1].id,
        function(bookedSeats) {
          console.log(bookedSeats);
          assert.equal(1, bookedSeats.length);
          assert.equal(studyTravels[1].id, bookedSeats[0].parentTravel);
          assert.equal('booked', bookedSeats[0].status);
          done();
        });
    });

    it('should successful reject seat booking', function(done) {
      console.log(seatAssignation);
      travelAdministrationSystem.rejectSeatBookingWith(seatAssignation.id,
        function(rejectSuccessful) {
          assert.equal(true, rejectSuccessful);
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