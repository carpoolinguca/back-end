var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var PhotoSystem = require('../controllers/profile-photo-administration-system');
var photoSystem = new PhotoSystem(sequelize);
var students = [];
var photo;

describe('Managing users profile photo', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      done();
    });
  });

  it('Initialy Juana does not have any user profile photo', function(done) {
    photoSystem.profilePhotoForUserById(students[0].id,
      function(foundPhoto) {
        assert.isNull(foundPhoto);
        done();
      });
  });

  it('Juana register profile photo', function(done) {
    photoSystem.registerOrUpdateIfExists({
        userId: students[0].id,
        fileName: 'juana.jpg'},
      function(err, previousPhotoName, registeredPhoto) {
        assert.isNull(err);
        assert.isNull(previousPhotoName);
        assert.equal(registeredPhoto.userId, students[0].id);
        assert.equal(registeredPhoto.fileName, 'juana.jpg');
        photo = registeredPhoto;
        done();
      });
  });

  it('Juana has juana.jpg as profile photo', function(done) {
    photoSystem.profilePhotoForUserById(students[0].id,
      function(foundPhoto) {
        assert.equal(photo.id, foundPhoto.id);
        assert.equal(photo.userId, foundPhoto.userId);
        assert.equal(photo.fileName, foundPhoto.fileName);
        done();
      });
  });

  it('Juana update profile photo', function(done) {
    photoSystem.registerOrUpdateIfExists({
        userId: students[0].id,
        fileName: 'juana-otra.jpg'},
      function(err, previousPhotoName, registeredPhoto) {
        assert.isNull(err);
        assert.equal(previousPhotoName, 'juana.jpg');
        assert.equal(registeredPhoto.userId, students[0].id);
        assert.equal(registeredPhoto.fileName, 'juana-otra.jpg');
        photo = registeredPhoto;
        done();
      });
  });

  it('Juana delete her profile photo', function(done) {
    photoSystem.unregister(photo.id,
      function(err, photoName) {
        assert.isNotOk(err);
        assert.equal(photoName, photo.fileName);
        photoSystem.profilePhotoForUserById(students[0].id,
          function(foundPhoto) {
            assert.isNull(foundPhoto);
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