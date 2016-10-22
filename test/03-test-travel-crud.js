var assert = require('chai').assert;
var TravelPersistenceManager = require('../controllers/travel-persistence-manager');

describe('Managing a travel', function() {
  var travel =
          {
            userid: 3,
            origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
            destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
            seats: 4,
            arrivalDateTime: "2016-10-21 14:05:06",
            observations: "De la biblio a la facu." 
   };
  var travelUpdate =
          {
            userid: 3,
            origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
            destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
            seats: 4,
            arrivalDateTime: "2016-10-21 14:05:06",
            observations: "De la biblio a la facu, no espero más de un minuto." 
   };
  var travelPersistenceManager = new TravelPersistenceManager();
  before(function(done) {
    travelPersistenceManager.create(travel , function(err) {
        if (err) throw err;
        done();
      }); 
  });
  describe('#read()', function() {
    
    it('should read without error', function(done) {
      travelPersistenceManager.read(function  (readTravels){
        assert.equal(readTravels[0].userid,3);
        done();
      });
    });
    it('should update without error', function(done){
      travelPersistenceManager.update(travel, travelUpdate, function(updatedTravel){
        assert.equal(updatedTravel.origin,travelUpdate.origin);
        assert.equal(updatedTravel.destination,travelUpdate.destination);
        assert.equal(updatedTravel.seats,travelUpdate.seats);
        assert.equal(updatedTravel.observations,travelUpdate.observations);
        done();
      });
    })
  });
  after(function(done) {
    travelPersistenceManager.delete(travelUpdate , function(err) {
        if (err) throw err;
        done();
      });
  });
});