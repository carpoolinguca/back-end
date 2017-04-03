var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var ReputationSystem = require('../controllers/reputation-system');
var reputationSystem = new ReputationSystem(sequelize);
var students = [];

describe('Managing a user', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      done();
    });
  });

  describe('#Complaints', function() {

    it('Initialy Juana have got any complaint', function(done) {
      reputationSystem.nameAndReputationForUserId(students[0].id,
        function(reputation) {
          assert.equal(reputation.complaints, 0);
          assert.equal(reputation.passengerPoints, 0);
          assert.equal(reputation.drivingPoints, 0);
          done();
        });
    });

    it('Juana was complained by Jacinta', function(done) {
      reputationSystem.registerComplaint({
          userFrom: students[1].id,
          userTo: students[0].id,
          reason: 'Me faltó el respeto'
        },
        function(complaint) {
          assert.equal(complaint.userFrom, students[1].id);
          assert.equal(complaint.reason, 'Me faltó el respeto');
          done();
        });
    });

    it('Juana does have got one complaint after was complained', function(done) {
      reputationSystem.nameAndReputationForUserId(students[0].id,
        function(reputation) {
          assert.equal(reputation.complaints, 1);
          done();
        });
    });
    /*
    Este test solo funcionará con la tabla de complaints limpia.

    it('Find all complaints', function(done) {
      reputationSystem.complaints(
        function(foundComplaints) {
          assert.equal(foundComplaints[0].userFrom, students[1].id);
          assert.equal(foundComplaints[0].userTo, students[0].id);
          assert.equal(foundComplaints[0].reason, 'Me faltó el respeto');
          done();
        });
    });
    */
    it('Find complaints to Juana', function(done) {
      reputationSystem.complaintsToUserById(students[0].id,
        function(foundComplaints) {
          assert.equal(foundComplaints[0].userFrom, students[1].id);
          assert.equal(foundComplaints[0].name, students[1].name);
          assert.equal(foundComplaints[0].lastname, students[1].lastname);
          assert.equal(foundComplaints[0].reason, 'Me faltó el respeto');
          done();
        });
    });

    it('Jacinta initial driving reputation is 0, and passenger reputation is 0', function(done) {
      reputationSystem.reputationForUserId(students[1].id,
        function(reputation) {
          assert.equal(reputation.userId, students[1].id);
          assert.equal(reputation.drivingPoints, 0);
          assert.equal(reputation.passengerPoints, 0);
          done();
        });
    });

    it('Juana register driver review about Jacinta', function(done) {
      var driverReview = {
        driverId: students[0].id,
        points: 5,
        passengerId: students[1].id,
        reviewTitle: 'Estupenda conductora',
        detailReview: 'Fue muy amable conmigo y llegó a la hora que habíamos acordado.'
      };
      reputationSystem.registerReviewAboutDriver(driverReview,
        function(review) {
          assert.equal(review.driverId, driverReview.driverId);
          assert.equal(review.points, driverReview.points);
          assert.equal(review.passengerId, driverReview.passengerId);
          assert.equal(review.reviewTitle, driverReview.reviewTitle);
          assert.equal(review.detailReview, driverReview.detailReview);
          assert.equal(review.isDriver, true);
          done();
        });
    });

    it('Juana register another driver review about Jacinta', function(done) {
      var driverReview = {
        driverId: students[0].id,
        points: 3,
        passengerId: students[1].id,
        reviewTitle: 'Condujo alterada',
        detailReview: 'Estuvo de mal humor y paso algunos semaforos en rojo. Pero llegué bien'
      };
      reputationSystem.registerReviewAboutDriver(driverReview, function(review) {
        assert.equal(review.driverId, driverReview.driverId);
        done();
      });
    });

    it('Reputation for driver must be 4', function(done) {
      reputationSystem.reputationForUserId(students[0].id,
        function(reputation) {
          assert.equal(reputation.drivingPoints, 4);
          done();
        });
    });

    /* Este test solo funciona con la tabla de reviews vacía

    it('Find all reviews', function(done) {
      reputationSystem.reviews(
        function(foundReviews) {
          assert.equal(foundReviews[0].driverId, students[0].id);
          done();
        });
    });

  */
    it('Find driver reviews for Jacinta', function(done) {
      reputationSystem.driverReviewsByUserId(students[0].id,
        function(foundReviews) {
          assert.equal(foundReviews[0].passengerId, students[1].id);
          assert.equal(foundReviews[0].name, students[1].name);
          assert.equal(foundReviews[0].lastname, students[1].lastname);
          done();
        });
    });

    it('Jacinta register passenger review about Juana', function(done) {
      var passengerReview = {
        driverId: students[0].id,
        points: 5,
        passengerId: students[1].id,
        reviewTitle: 'Muy buena acompañante',
        detailReview: 'Muy crack, muy buena onda.'
      };
      reputationSystem.registerReviewAboutPassenger(passengerReview,
        function(review) {
          assert.equal(review.driverId, passengerReview.driverId);
          assert.equal(review.points, passengerReview.points);
          assert.equal(review.passengerId, passengerReview.passengerId);
          assert.equal(review.reviewTitle, passengerReview.reviewTitle);
          assert.equal(review.detailReview, passengerReview.detailReview);
          assert.equal(review.isDriver, false);
          done();
        });
    });

    it('Find passenger reviews for Juana', function(done) {
      reputationSystem.passengerReviewsByUserId(students[1].id,
        function(foundReviews) {
          assert.equal(foundReviews[0].driverId, students[0].id);
          assert.equal(foundReviews[0].name, students[0].name);
          assert.equal(foundReviews[0].lastname, students[0].lastname);
          done();
        });
    });

  });

  after(function(done) {
    userTestResource.destroy(function() {
      done();
    });
  });

});