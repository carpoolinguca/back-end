var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var Travel = require('../models/travel')(sequelize);


describe('Managing a travel', function() {
  var travel = {
    userId: 58,
    origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
    destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
    seats: 4,
    arrivalDateTime: "2016-10-21 14:05:06",
    observations: "De la biblio a la facu."
  };
  var anotherTravel = {
    userId: 58,
    origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
    destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
    seats: 4,
    arrivalDateTime: "2016-10-21 14:05:06",
    observations: "De la biblio a la Purmamarca."
  };
  var travelUpdate = {
    userId: 58,
    origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
    destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
    seats: 4,
    arrivalDateTime: "2016-10-21 14:05:06",
    observations: "De la biblio a la facu, no espero más de un minuto."
  };
  before(function(done) {
    sequelize.sync();
    Travel.create(travel).then(function(createdTravel) {
      travel = createdTravel;
      Travel.create(anotherTravel).then(function(otherCreatedTravel) {
        done();
      });
    });
  });
  describe('#findAll()', function() {

    it('should find without error', function(done) {
      Travel.findAll({
        where: {
          id: travel.id
        }
      }).then(function(readTravels) {
        assert.equal(readTravels[0].observations, "De la biblio a la facu.");
        done();
      });
    });
    it('should update without error', function(done) {
      travel.update(travelUpdate).then(function(updatedTravel) {
        console.log(updatedTravel);
        assert.equal(updatedTravel.userId, travelUpdate.userId);
        assert.equal(updatedTravel.origin, travelUpdate.origin);
        assert.equal(updatedTravel.destination, travelUpdate.destination);
        assert.equal(updatedTravel.seats, travelUpdate.seats);
        assert.equal(updatedTravel.observations, travelUpdate.observations);
        done();
      });
    });
  });
  after(function(done) {
    travel.destroy().then(function() {
      done();
    });
  });
});