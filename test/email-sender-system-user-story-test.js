var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var EmailSystem = require('../controllers/email-sender-system');
var emailSystem = new EmailSystem(sequelize);
var students = [];
var car;

describe('Sending emails', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      done();
    });
  });

  it('Welcome message', function(done) {
    emailSystem.sendWelcome(students[0],
      function(error) {
        assert.isNull(error);
        done();
      });
  });

  it('New password message', function(done) {
    emailSystem.sendNewPassword(students[0], 'newPassword',
      function(error) {
        assert.isNull(error);
        done();
      });
  });

  after(function(done) {
    userTestResource.destroy(function() {
      done();
    });
  });
});