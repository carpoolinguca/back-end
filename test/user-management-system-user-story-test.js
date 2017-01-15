var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var students = [];

describe('Managing a user', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      done();
    });
  });

  describe('#findAll()', function() {

    it('should find without error', function(done) {
      userAdministrationSystem.userIdentifiedBy(
        students[0].id,
        function(readUser) {
          assert.equal(readUser.email, 'juana@gmail.com');
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