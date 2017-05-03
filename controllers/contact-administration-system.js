var Sequelize;
var Contact;

function ContactAdministrationSystem(sequelize) {
	Contact = require('../models/contact')(sequelize);
	Sequelize = sequelize;
}

ContactAdministrationSystem.prototype.registerAContactWith = function(anUserId, anotherUserId, callback) {
	Contact.findCreateFind({
		where: {
			userId: anUserId,
			contactId: anotherUserId
		},
		defaults: {
			userId: anUserId,
			contactId: anotherUserId,
			isFavorite: false
		}
	}).catch(function(errors) {
		console.log('errors---------------------------------');
		console.log(errors);
	}).then(function(result) {
		callback(result[0]);
	});
};

ContactAdministrationSystem.prototype.registerAllContactsWith = function(aDriverId, aCollectionOfPassengerIds, callback) {
	//Esta algo feo, pero se resuelve de esta forma, para asegurarme de que el callback sea llamado cuando todos los contactos fueron registrados.
	var self = this;
	var numberOfContactsRegistered = 0;
	var aCollectionOfPassengerIdsLenght = aCollectionOfPassengerIds.length + 1;
	aCollectionOfPassengerIds.forEach(function(passengerId, array, index) {
		self.registerAContactWith(passengerId, aDriverId, () => {
			numberOfContactsRegistered++;
			self.registerAContactWith(aDriverId, passengerId, () => {
				numberOfContactsRegistered++;
				if (numberOfContactsRegistered === aCollectionOfPassengerIdsLenght) {
					callback(numberOfContactsRegistered);
				}
			});
		});
	});
};

ContactAdministrationSystem.prototype.acquaintancesForUserIdentifedBy = function(anUserId, callback) {
	var queryString = 'SELECT c.id, r."userId", u.name, u.lastname, u.email, u.phone, r."passengerPoints", r."drivingPoints", r.complaints from "user" as u INNER JOIN reputation as r on (u.id = r."userId" ) INNER JOIN contact as c ON (c."contactId"=r."userId") WHERE c."userId" = ' + anUserId + ' AND "isFavorite"=false ORDER BY u.name, u.lastname ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
	});
};

ContactAdministrationSystem.prototype.becomeFavorite = function(aContactId, callback) {
	Contact.findById(aContactId).then(function(foundContact) {
		if (!foundContact) {
			callback(new Error('No se a encontrado un contacto con el id: ' + aContactId));
			return;
		}
		foundContact.isFavorite = true;
		foundContact.save().then(function() {
			foundContact.reload().then(function() {
				callback(null, foundContact);
			});
		});
	});
};

ContactAdministrationSystem.prototype.becomeAcquaintance = function(aContactId, callback) {
	Contact.findById(aContactId).then(function(foundContact) {
		if (!foundContact) {
			callback(new Error('No se a encontrado un contacto con el id: ' + aContactId));
			return;
		}
		foundContact.isFavorite = false;
		foundContact.save().then(function() {
			foundContact.reload().then(function() {
				callback(null, foundContact);
			});
		});
	});
};

ContactAdministrationSystem.prototype.favoritesForUserIdentifedBy = function(anUserId, callback) {
	var queryString = 'SELECT c.id, r."userId", u.name, u.lastname, u.email, u.phone, r."passengerPoints", r."drivingPoints", r.complaints from "user" as u INNER JOIN reputation as r on (u.id = r."userId" ) INNER JOIN contact as c ON (c."contactId"=r."userId") WHERE c."userId" = ' + anUserId + ' AND "isFavorite"=true ORDER BY u.name, u.lastname ;';
	Sequelize.query(queryString, {
		type: Sequelize.QueryTypes.SELECT
	}).then(function(results) {
		callback(results);
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