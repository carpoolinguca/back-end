var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var ContactAdministrationSystem = require('../controllers/contact-administration-system');
var contactSystem = new ContactAdministrationSystem(sequelize);
var Contact = require('../models/contact')(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var students = [];
var contacts = [];

describe('Contact administration (one contact insert test)', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      done();
    });
  });

  it('Insert a contact', function(done) {
    contactSystem.registerAContactWith(students[0].id, students[1].id, function(registeredContact) {
      assert.equal(registeredContact.userId, students[0].id);
      assert.equal(registeredContact.contactId, students[1].id);
      assert.isNotOk(registeredContact.isFavorite);
      contacts.push(registeredContact);
      done();
    });
  });

  it('Not fail when try to insert the same contact', function(done) {
    contactSystem.registerAContactWith(students[0].id, students[1].id, function(registeredContact) {
      assert.equal(registeredContact.userId, students[0].id);
      assert.equal(registeredContact.contactId, students[1].id);
      assert.isNotOk(registeredContact.isFavorite);
      done();
    });
  });

  it('Insert another contact', function(done) {
    contactSystem.registerAContactWith(students[1].id, students[0].id, function(registeredContact) {
      assert.equal(registeredContact.userId, students[1].id);
      assert.equal(registeredContact.contactId, students[0].id);
      assert.isNotOk(registeredContact.isFavorite);
      contacts.push(registeredContact);
      done();
    });
  });

  it('Query contacts for user', function(done) {
    contactSystem.acquaintancesForUserIdentifedBy(students[0].id, function(foundContacts) {
      assert.equal(foundContacts[0].userId, students[1].id);
      done();
    });
  });

  it('Make a contact favorite', function(done) {
    contactSystem.becomeFavorite(contacts[0].id, function(err, favorite) {
      assert.equal(favorite.userId, students[0].id);
      assert.isOk(favorite.isFavorite);
      done();
    });
  });

  it('Query favorites for user', function(done) {
    contactSystem.favoritesForUserIdentifedBy(students[0].id, function(foundFavorites) {
      assert.equal(foundFavorites[0].userId, students[1].id);
      done();
    });
  });

  it('Make a contact not favorite', function(done) {
    contactSystem.becomeAcquaintance(contacts[0].id, function(err, favorite) {
      assert.equal(favorite.userId, students[0].id);
      assert.isNotOk(favorite.isFavorite);
      done();
    });
  });

  after(function(done) {
    userTestResource.destroy(function() {
      done();
    });
  });
});



describe('Contact administration (multiple contacts insert test)', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      done();
    });
  });

  it('Insert all contacts between driver and passengers', function(done) {
    var passengers = [students[0].id];
    contactSystem.registerAllContactsWith(students[1].id, passengers, function(numberOfRegisteredContacts) {
      assert.equal(numberOfRegisteredContacts, 2)
      done();
    });
  });

  after(function(done) {
    userTestResource.destroy(function() {
      done();
    });
  });
});