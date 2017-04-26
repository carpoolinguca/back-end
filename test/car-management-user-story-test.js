var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var CarSystem = require('../controllers/car-administration-system');
var carSystem = new CarSystem(sequelize);
var students = [];

describe('Managing users cars', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      done();
    });
  });

  it('Initialy Juana have got any cars', function(done) {
    carSystem.carsForUserById(students[0].id,
      function(cars) {
        console.log(cars);
        assert.equal(cars.length, 0);
        done();
      });
  });

  it('Juana register an Up!', function(done) {
    carSystem.register({
        userId: students[0].id,
        model: 'Volkswagen Up!',
        color: 'Blanco',
        licensePlate: 'AG759LH',
        hasAirConditioner: true,
      },
      function(err, registeredCar) {
        assert.isNull(err);
        assert.equal(registeredCar.userId, students[0].id);
        assert.equal(registeredCar.model, 'Volkswagen Up!');
        assert.equal(registeredCar.color, 'Blanco');
        assert.equal(registeredCar.licensePlate, 'AG759LH');
        assert.equal(registeredCar.hasAirConditioner, true);
        done();
      });
  });

  it('Juana can not register a repeated car', function(done) {
    carSystem.register({
        userId: students[0].id,
        model: 'Volkswagen Up!',
        color: 'Blanco',
        licensePlate: 'AG759LH',
        hasAirConditioner: true,
      },
      function(err, registeredCar) {
        assert.isOk(err);
        assert.equal(err.message,'Ya existe un auto registrado con la patente: AG759LH')
        assert.isUndefined(registeredCar);
        done();
      });
  });

  after(function(done) {
    userTestResource.destroy(function() {
      done();
    });
  });
});