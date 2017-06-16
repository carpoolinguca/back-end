var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var students = [];
var temporaryPassword = '';

describe('Managing a user', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      done();
    });
  });

  it('Should find without error', function(done) {
    userAdministrationSystem.userIdentifiedBy(
      students[0].id,
      function(readUser) {
        assert.equal(readUser.email, 'juana@gmail.com');
        done();
      });
  });

  it('Can not register new user with email already registered', function(done) {
    var userAlreadyRegistered = {
      email: 'jacinta@gmail.com',
      password: '4321',
      name: 'Jacinta',
      lastname: 'La Cinta',
      ucaid: '020800234',
      sex: 'Femenino',
      phone: '1138475938'
    };

    userAdministrationSystem.register(userAlreadyRegistered, function(err, anUser) {
      assert.isOk(err);
      assert.equal(err.message, 'Ya existe un usuario registrado con el email: jacinta@gmail.com');
      assert.isUndefined(anUser);
      done();
    });
  });

  it('Validate email and password', function(done) {

    userAdministrationSystem.validateEmailAndPassword(students[0].email, '1234',
      function(err, user) {
        assert.isNull(err);
        assert.equal(user.email, students[0].email);
        done();
      });
  });

  it('Generate and validate temporaryPassword', function(done) {

    userAdministrationSystem.temporaryPasswordFor(students[0], function(newPassword) {
      temporaryPassword = newPassword;
      console.log(newPassword);
      userAdministrationSystem.validatePassword(students[0], newPassword, function(err) {
        assert.isNull(err);
        done();
      });
    });
  });

  it('Change password', function(done) {
    var passwordChangedManually = 'SecurestPassword';
    userAdministrationSystem.changePassword(students[0].id, temporaryPassword, passwordChangedManually, function(err) {
      assert.isNull(err);
      userAdministrationSystem.validateEmailAndPassword(students[0].email, passwordChangedManually, function(err, user) {
        assert.isNull(err);
        assert.equal(user.email, students[0].email);
        done();
      });
    });
  });

  it('After manually changed password, temporary password is invalid', function(done) {

    userAdministrationSystem.validateEmailAndPassword(students[0].email, temporaryPassword, function(err, anUser) {
      assert.isOk(err);
      assert.equal(err.message, 'Incorrect password');
      assert.isUndefined(anUser);
      done();
    });
  });

  after(function(done) {
    userTestResource.destroy(function() {
      done();
    });
  });
});