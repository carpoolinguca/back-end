var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);

describe('Managing a user', function() {
  var user = {
    email: 'juana@gmail.com',
    password: '1234',
    name: 'Juana',
    lastname: 'La Loca',
    ucaid: '020800233',
    sex: 'Femenino',
    phone: '1569867497'
  };
  var userUpdate = {
    email: 'juana@gmail.com',
    password: '4321',
    name: 'Juana',
    lastname: 'La Loca',
    ucaid: '020800233',
    sex: 'Femenino',
    phone: '1569867497'
  };

  before(function(done) {
    User.create(user).then(function(createdUser) {
      user = createdUser;
      done();
    });
  });
  describe('#findAll()', function() {

    it('should find without error', function(done) {
      User.findOne({
        where: {
          email: userUpdate.email
        }
      }).then(function(readUser) {
        assert.equal(readUser.email, 'juana@gmail.com');
        assert.equal(readUser.phone, user.phone);
        done();
      });
    });
    it('should update without error', function(done) {
      user.update(userUpdate).then(function(updatedUser) {
        assert.equal(updatedUser.password, '4321');
        done();
      });
    });

  });
  after(function(done) {
    user.destroy().then(function() {
      done();
    });
  });
});