var assert = require('chai').assert;
var UserPersistenceManager = require('../controllers/user-persistence-manager');

describe('Managing a user', function() {
  var user =
          {
            email: 'juana@gmail.com',
            password: '1234',
            name: 'Juana',
            lastname: 'La Loca',
            ucaid: '020800233',
            sex: 'Femenino',
          };
  var userUpdate =
          {
            email: 'juana@gmail.com',
            password: '4321',
            name: 'Juana',
            lastname: 'La Loca',
            ucaid: '020800233',
            sex: 'Femenino',
          };
  var userPersistenceManager = new UserPersistenceManager();
  before(function(done) {
    userPersistenceManager.create(user , function(err) {
        if (err) throw err;
        done();
      }); 
  });
  describe('#read()', function() {
    
    it('should read without error', function(done) {
      userPersistenceManager.read(function  (readUsers){
        assert.equal(readUsers[0].email,'juana@gmail.com');
        done();
      });
    });
    it('should update without error', function(done){
      userPersistenceManager.update(user, userUpdate, function(updatedUser){
        assert.equal(updatedUser.password,'4321');
        done();
      });
    })
  });
  after(function(done) {
    userPersistenceManager.delete(userUpdate , function(err) {
        if (err) throw err;
        done();
      });
  });
});