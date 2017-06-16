var ReputationSystem = require('../controllers/reputation-system.js');
var reputationSystem;
var CarSystem = require('../controllers/car-administration-system.js');
var carSystem;
var ContactSystem = require('../controllers/contact-administration-system.js');
var contactSystem;
var PhotoSystem = require('../controllers/profile-photo-administration-system');
var photoSystem;
var EmailSenderSystem = require('../controllers/email-sender-system');
var emailSenderSystem;
var bcrypt = require('bcrypt');
var saltRounds = 10;
var passwordGenerator = require('generate-password');

var Sequelize;
var User;
var TemporaryPassword;

function UserAdministrationSystem(sequelize) {
	User = require('../models/user')(sequelize);
	TemporaryPassword = require('../models/temporary-password')(sequelize);
	reputationSystem = new ReputationSystem(sequelize);
	carSystem = new CarSystem(sequelize);
	contactSystem = new ContactSystem(sequelize);
	photoSystem = new PhotoSystem(sequelize);
	emailSenderSystem = new EmailSenderSystem();
	Sequelize = sequelize;
}

UserAdministrationSystem.prototype.register = function(user, callback) {
	this.oneUserFilteredBy({
		where: {
			email: user.email
		}
	}, function(userFound) {
		if (userFound !== null) {
			callback(new Error('Ya existe un usuario registrado con el email: ' + userFound.email));
			return;
		}
		bcrypt.hash(user.password, saltRounds, function(err, hash) {
			user.password = hash;
			User.create(user).then(function(userCreated) {
				reputationSystem.initializeReputationFor(userCreated, function() {
					emailSenderSystem.sendWelcome(userCreated, function() {});
					callback(null, {
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

UserAdministrationSystem.prototype.changePassword = function(userId, oldPassword, newPassword, callback) {
	var self = this;
	User.findById(userId).then(function(userFound) {
		if (!userFound) {
			return callback(new Error('No se encontró el usuario.'));
		}
		self.validatePassword(userFound, oldPassword, function(err) {
			if (err) {
				return (err);
			}
			bcrypt.hash(newPassword, saltRounds, function(err, hash) {
				console.log(hash);
				userFound.password = hash;
				userFound.save().then(function() {
					self.destroyAllTemporaryPasswordsFor(userFound, function() {
						callback(null);
					});
				});
			});
		});
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

UserAdministrationSystem.prototype.validatePassword = function(user, password, callback) {
	var self = this;
	bcrypt.compare(password, user.password, function(err, res) {
		if (res === false) {
			self.validateTemporaryPassword(user, password, function(err) {
				if (err) {
					callback(err);
					return;
				}
				callback(null);
			});
		} else {
			callback(null);
		}
	});
};

UserAdministrationSystem.prototype.validateEmailAndPassword = function(email, password, callback) {
	var self = this;
	self.oneUserFilteredBy({
		where: {
			email: email
		}
	}, function(user) {
		if (!user) {
			console.log(user);
			callback(new Error('Incorrect email'));
			return;
		}
		self.validatePassword(user, password, function(err) {
			if (err) {
				callback(err);
				return;
			}
			carSystem.carsForUserById(user.id, function(cars) {
				photoSystem.profilePhotoForUserById(user.id, function(foundPhoto) {
					var fileName = '';
					if (foundPhoto) {
						fileName = foundPhoto.fileName;
					}
					callback(null, {
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
		});
	});
};

UserAdministrationSystem.prototype.findOneTemporaryPasswordForToday = function(user, callback) {
	TemporaryPassword.findOne({
		where: {
			userId: user.id,
			createdAt: {
				$lt: new Date(),
				$gt: new Date(new Date() - 24 * 60 * 60 * 1000)
			}
		},
		order: [
			['createdAt', 'DESC']
		]
	}).then(function(foundTemporaryPassword) {
		callback(foundTemporaryPassword);
	});
};

UserAdministrationSystem.prototype.validateTemporaryPassword = function(user, password, callback) {
	this.findOneTemporaryPasswordForToday(user, function(foundTemporaryPassword) {
		if (!foundTemporaryPassword)
			return callback(new Error('Incorrect password'));
		bcrypt.compare(password, foundTemporaryPassword.password, function(err, res) {
			if (res === false) {
				return callback(new Error('Incorrect password'));
			}
			callback(null);
		});
	});
};

UserAdministrationSystem.prototype.temporaryPasswordFor = function(user, callback) {
	var newPassword = passwordGenerator.generate({
		length: 10,
		numbers: true
	});
	bcrypt.hash(newPassword, saltRounds, function(err, hash) {
		TemporaryPassword.create({
			userId: user.id,
			password: hash
		}).then(function(temporaryPassword) {
			callback(newPassword);
		});
	});
};

UserAdministrationSystem.prototype.sendNewPassword = function(email, callback) {
	var self = this;
	self.oneUserFilteredBy({
		where: {
			email: email
		}
	}, function(userFound) {
		if (!userFound) {
			callback(new Error('No se ha encontrado un usuario registrado con el email: ' + email));
			return;
		}
		self.findOneTemporaryPasswordForToday(userFound, function(foundTemporaryPassword) {
			if (!foundTemporaryPassword) {
				self.temporaryPasswordFor(userFound, function(newPassword) {
					console.log(newPassword);
					emailSenderSystem.sendNewPassword(userFound, newPassword, function(err) {
						callback(err);
					});
				});
			} else {
				callback(new Error('En las últimas 24hs ya se ha enviado un mail de recuperación de contraseña.'));
				return;
			}
		});
	});
};

UserAdministrationSystem.prototype.registerCar = function(car, callback) {
	carSystem.register(car, callback);
};

UserAdministrationSystem.prototype.destroyAllTemporaryPasswordsFor = function(user, callback) {
	TemporaryPassword.destroy({
		where: {
			userId: user.id
		}
	}).then(function(numberOfDelated) {
		callback();
	});
};

UserAdministrationSystem.prototype.destroy = function(userReceibed, callback) {
	var self = this;
	User.findById(userReceibed.id).then(function(userFound) {
		reputationSystem.destroyAllOpinionsFor(userReceibed, function() {
			carSystem.destroyAllCarsFor(userReceibed, function() {
				contactSystem.destroyAllContactsFor(userReceibed, function() {
					photoSystem.destroyAllPhotosFor(userReceibed, function() {
						self.destroyAllTemporaryPasswordsFor(userReceibed, function() {
							userFound.destroy().then(function() {
								callback();
							});
						});
					});
				});
			});
		});
	});
};

module.exports = UserAdministrationSystem;