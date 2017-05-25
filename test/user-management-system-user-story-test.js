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
        assert.equal(err.message, 'Ya existe un usuario registrado con el email: jacinta@gmail.com')
        assert.isUndefined(anUser);
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