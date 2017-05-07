var ReputationSystem = require('../controllers/reputation-system.js');
var reputationSystem;
var CarSystem = require('../controllers/car-administration-system.js');
var carSystem;
var ContactSystem = require('../controllers/contact-administration-system.js');
var contactSystem;
var PhotoSystem = require('../controllers/profile-photo-administration-system');
var photoSystem;
var bcrypt = require('bcrypt');
var saltRounds = 10;

var Sequelize;
var User;

function UserAdministrationSystem(sequelize) {
	User = require('../models/user')(sequelize);
	reputationSystem = new ReputationSystem(sequelize);
	carSystem = new CarSystem(sequelize);
	contactSystem = new ContactSystem(sequelize);
	photoSystem = new PhotoSystem(sequelize);
	Sequelize = sequelize;
}

UserAdministrationSystem.prototype.register = function(user, callback) {
	bcrypt.hash(user.password, saltRounds, function(err, hash) {
		user.password = hash;
		User.create(user).then(function(userCreated) {
			reputationSystem.initializeReputationFor(userCreated, function() {
				callback({
					id: userCreated.id,
					email: userCreated.email,
					name: userCreated.name,
					lastname: userCreated.lastname,
					ucaid: userCreated.ucaid,
					sex: userCreated.sex,
					phone: userCreated.phone
				});
			});
		});
	});
};

UserAdministrationSystem.prototype.update = function(user, callback, notFoundCallback) {
	User.findById(user.id).then(function(userFound) {
		if (userFound !== null) {
			userFound.update(user, {
				fields: ['email', 'name', 'lastname', 'ucaid', 'sex', 'phone']
			}).then(function() {
				userFound.reload().then(function() {
					callback({
						id: userFound.id,
						email: userFound.email,
						name: userFound.name,
						lastname: userFound.lastname,
						ucaid: userFound.ucaid,
						sex: userFound.sex,
						phone: userFound.phone
					});
				});
			});
		} else {
			notFoundCallback();
		}
	});
};

UserAdministrationSystem.prototype.changePassword = function(userId, oldPassword, newPassword, successfull, unsuccesfull) {
	User.findById(userId).then(function(userFound) {
		if (userFound !== null) {
			bcrypt.compare(oldPassword, userFound.password, function(err, res) {
				if (res === true) {
					bcrypt.hash(newPassword, saltRounds, function(err, hash) {
						userFound.password = hash;
						userFound.save().then(function() {
							successfull();
						});
					});
				} else {
					unsuccesfull('Contraseña incorrecta.');
				}
			});
		} else {
			unsuccesfull('No se encontró el usuario.');
		}
	});
};

UserAdministrationSystem.prototype.usersFilteredBy = function(parameters, callback) {
	User.findAll(parameters).then(function(users) {
		callback(users);
	});
};

UserAdministrationSystem.prototype.oneUserFilteredBy = function(parameters, callback) {
	User.findOne(parameters).then(function(user) {
		callback(user);
	});
};

UserAdministrationSystem.prototype.userIdentifiedBy = function(identification, callback) {
	User.findById(identification).then(function(readedUser) {
		callback(readedUser);
	});
};

UserAdministrationSystem.prototype.validateEmailAndPassword = function(email, password, invalidEmailCallback, invalidPasswordCallback, validUserCallback) {
	this.oneUserFilteredBy({
		where: {
			email: email
		}
	}, function(user) {
		if (!user) {
			invalidEmailCallback();
		} else {
			bcrypt.compare(password, user.password, function(err, res) {
				if (res === true) {
					carSystem.carsForUserById(user.id, function(cars) {
						photoSystem.profilePhotoForUserById(user.id, function(photo) {
							var fileName = '';
							if (foundPhoto) {
								fileName = foundPhoto.fileName;
							}
							validUserCallback({
								id: user.id,
								email: user.email,
								name: user.name,
								lastname: user.lastname,
								ucaid: user.ucaid,
								sex: user.sex,
								phone: user.phone,
								cars: cars,
								photo: fileName
							});
						});
					});
				} else {
					invalidPasswordCallback();
				}
			});
		}
	});
};

UserAdministrationSystem.prototype.registerCar = function(car, callback) {
	carSystem.register(car, callback);
};

UserAdministrationSystem.prototype.destroy = function(userReceibed, callback) {
	User.findById(userReceibed.id).then(function(userFound) {
		reputationSystem.destroyAllOpinionsFor(userReceibed, function() {
			carSystem.destroyAllCarsFor(userReceibed, function() {
				contactSystem.destroyAllContactsFor(userReceibed, function() {
					photoSystem.destroyAllPhotosFor(userReceibed, function() {
						userFound.destroy().then(function() {
							callback();
						});
					});
				});
			});
		});
	});
};


module.exports = UserAdministrationSystem;