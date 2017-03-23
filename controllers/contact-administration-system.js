var Sequelize;
var Contact;

function ContactAdministrationSystem(sequelize) {
	Contact = require('../models/contact')(sequelize);
	Sequelize = sequelize;
}


ContactAdministrationSystem.prototype.registerAsContacts = function(aDriver, aPassenger, callback) {
	Contact.create({userId : aDriver, passengerId: aPassenger}).then(function(userCreated) {
			callback(userCreated);
		});
	};
};

ContactAdministrationSystem.prototype.registerAsContactsBetween = function(aDriver, aPassenger, callback) {
	Contact.findOrCreate({where: {username: 'sdepold'}, defaults: {job: 'Technical Lead JavaScript'}})
  .spread(function(user, created) {
    console.log(user.get({
      plain: true
    }));
    console.log(created);
    callback(created);
  });
};

ContactAdministrationSystem.prototype.destroy = function(callback) {
	Contact.destroy({
		truncate: true
	}).then(function() {
		callback();
	});
};

ContactAdministrationSystem.prototype.destroyAllContactsFor = function(user, callback) {
	Contact.destroy({
		where: {
			$or: [{
				userId: user.id
			}, {
				contactId: user.id
			}]
		}
	}).then(function(numberOfDeleted) {
		callback();
	});
};

module.exports = ContactAdministrationSystem;