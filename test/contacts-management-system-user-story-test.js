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
      }];
      done();
    });
  });

  it('Does not insert already contact saved', function(done) {
    Contact.findCreateFind({
      where: contacts[0],
      defaults: contacts[0]
    }).catch(function(errors) {
      console.log(errors);
    }).then(function(result) {
      console.log(result[0]);
      //assert.equal(contactSaved.userId, contacts[0].userId);
      contacts[0] = result[0];
      result[0].destroy();
      done();
    });
  });

  it('Does not insert already contact saved2', function(done) {
    Contact.findCreateFind({
      where: contacts[1],
      defaults: contacts[1]
    }).catch(function(errors) {
      console.log(errors);
    }).then(function(result) {
      console.log(result[1]);
      //assert.equal(contactSaved.userId, contacts[0].userId);
      contacts[1] = result[0];
      result[0].destroy();
      done();
    });
  });

  after(function(done) {
    userTestResource.destroy(function() {
      done();
    });
  });
});