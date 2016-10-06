var assert = require('chai').assert;
var PersistenceManager = require('../routes/persistence-manager');

describe('Managing a travel', function() {
  var travel =
          {
            driver: 'Fangio',
            name: 'Belgrano',
            origin: 'Belgrano 280, Bernal, Buenos Aires, Argentina',
            destination: 'Belgrano 380, Bernal, Buenos Aires, Argentina',
            trajectory: 'LINESTRING( -34.71256 -58.2798, -34.71204 -58.28095, -34.71165 -58.2818)'
          };
  var updateTravel =
          {
            driver: 'Meteoro',
            name: 'Belgrano',
            origin: 'Belgrano 280, Bernal, Buenos Aires, Argentina',
            destination: 'Belgrano 380, Bernal, Buenos Aires, Argentina',
            trajectory: 'LINESTRING( -34.71256 -58.2798, -34.71204 -58.28095, -34.71165 -58.2818)'
          };
  var persistenceManager = new PersistenceManager();
  before(function(done) {
    persistenceManager.create(travel , function(err) {
        if (err) throw err;
        done();
      }); 
  });
  describe('#read()', function() {
    
    it('should read without error', function(done) {
      persistenceManager.read(function  (readDrivers){
        assert.equal(readDrivers[0].driver,'Fangio');
        done();
      });
    });
    it('should update without error', function(done){
      persistenceManager.update(travel, updateTravel, function(updatedTravel){
        assert.equal(updatedTravel.driver,'Meteoro');
        done();
      });
    })
  });
  after(function(done) {
    persistenceManager.delete(updateTravel , function(err) {
        if (err) throw err;
        done();
      });
  });
});