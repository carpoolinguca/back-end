var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var ReputationSystem = require('../controllers/reputation-system');
var reputationSystem = new ReputationSystem(sequelize)
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

    it('Juana was complained by Jacinta', function(done) {
      reputationSystem.registerComplaint({
          userFrom: students[1].id,
          userTo: students[0].id,
          reason: 'Me faltó el respeto'
        },
        function(complaint) {
          assert.equal(complaint.userFrom, students[1].id);
          assert.equal(complaint.userTo, students[0].id);
          assert.equal(complaint.reason, 'Me faltó el respeto');
          done();
        });
    });

    it('Find all complaints', function(done) {
      reputationSystem.complaints(
        function(foundComplaints) {
          assert.equal(foundComplaints[0].userFrom, students[1].id);
          assert.equal(foundComplaints[0].userTo, students[0].id);
          assert.equal(foundComplaints[0].reason, 'Me faltó el respeto');
          done();
        });
    });

    it('Find complaints to Juana', function(done) {
      reputationSystem.complaintsToUserById(students[0].id,
        function(foundComplaints) {
          assert.equal(foundComplaints[0].userFrom, students[1].id);
          assert.equal(foundComplaints[0].userTo, students[0].id);
          assert.equal(foundComplaints[0].reason, 'Me faltó el respeto');
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