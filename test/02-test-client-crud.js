var assert = require('chai').assert;
var ClientPersistenceManager = require('../controllers/client-persistence-manager');

describe('Managing a client', function() {
  var client =
          {
            name: 'Shumi',
            id: '33',
            secret: '1234',
            userId: '1'
          };
  var updateClient =
          {
            name: 'Shumi',
            id: '33',
            secret: '4321',
            userId: '1'
          };
  var clientPersistenceManager = new ClientPersistenceManager();
  before(function(done) {
    clientPersistenceManager.create(client , function(err) {
        if (err) throw err;
        done();
      }); 
  });
  describe('#read()', function() {
    
    it('should read without error', function(done) {
      clientPersistenceManager.read(function  (readClients){
        assert.equal(readClients[0].name,'Shumi');
        done();
      });
    });
    it('should update without error', function(done){
      clientPersistenceManager.update(client, updateClient, function(updatedClient){
        assert.equal(updatedClient.secret,'4321');
        done();
      });
    })
  });
  after(function(done) {
    clientPersistenceManager.delete(updateClient , function(err) {
        if (err) throw err;
        done();
      });
  });
});