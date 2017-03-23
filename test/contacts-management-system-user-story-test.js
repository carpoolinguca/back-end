var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var UserAdministrationSystem = require('../controllers/user-administration-system');
var userAdministrationSystem = new UserAdministrationSystem(sequelize);
var Contact = require('../models/contact')(sequelize);
var UserTestResource = require('./user-test-resource');
var userTestResource = new UserTestResource(userAdministrationSystem);
var students = [];
var contacts = [];

describe('Contact administration', function() {
  before(function(done) {
    sequelize.sync();
    userTestResource.registerUsers(function(users) {
      students = users;
      contacts = [{
        userId: students[0].id,
        contactId: students[1].id
      }, {
        userId: students[1].id,
        contactId: students[0].id
      }, {
        userId: students[0].id,
        contactId: students[1].id
      }];
      done();
    });
  });

  it('Register contact', function(done) {
    Contact.bulkCreate(contacts).catch(function(errors) {
      console.log(errors);
    }).then(function() {
      Contact.findAll().then(function(createdContacts) {
        console.log(createdContacts);
        contacts = createdContacts;
        done();
      });
    });
  });

  after(function(done) {
    contacts[1].destroy();
    contacts[0].destroy();
    userTestResource.destroy(function() {
      done();
    });
  });
});