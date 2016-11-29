var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var Travel = require('../models/travel')(sequelize);
var createTravels = require('./createTravels')(User, Travel);

var students = [];
var studyTravels = [];

describe('Managing a travel', function() {
  before(function(done) {
    sequelize.sync();
    createTravels(function(users, travels) {
      students = users;
      studyTravels = travels;
      done();
    });
  });

  describe('#findAll()', function() {

    it('should find without error', function(done) {
      Travel.findAll({
        where: {
          id: studyTravels[0].id
        }
      }).then(function(readTravels) {
        assert.equal(readTravels[0].observations, "De la biblio a la facu.");
        done();
      });
    });
    it('should update without error', function(done) {
      var studyTravel = studyTravels[0];
      studyTravel.update(studyTravels[1].dataValues).then(function(updatedTravel) {
        console.log(studyTravels[1].dataValues);
        console.log(updatedTravel.dataValues);
        assert.equal(updatedTravel.dataValues.userId, studyTravels[1].userId);
        assert.equal(updatedTravel.dataValues.origin, studyTravels[1].origin);
        assert.equal(updatedTravel.dataValues.destination, studyTravels[1].destination);
        assert.equal(updatedTravel.dataValues.seats, studyTravels[1].seats);
        assert.equal(updatedTravel.dataValues.userIsDriving, studyTravels[1].userIsDriving);
        assert.equal(updatedTravel.dataValues.observations, studyTravels[1].observations);
        done();
      });
    });
  });
  after(function(done) {
      Travel.destroy({
        truncate: true
      }).then(function(){
        User.destroy({
          truncate: false,
          where: {
            sex: 'Femenino'
          }
        }).then(function() {
          done();
        });
      });
  });
});