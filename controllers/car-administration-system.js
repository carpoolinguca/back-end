var Sequelize;
var User;
var Car;

function CarSystem(sequelize) {
	User = require('../models/user')(sequelize);
	Car = require('../models/car')(sequelize);
	Sequelize = sequelize;
}


CarSystem.prototype.carsForUserById = function(userId, callback) {
	Car.findAll({
		where: {
			userId: userId
		},
		attributes: ['id', 'model', 'color', 'licensePlate', 'hasAirConditioner']
	}).then(function(carsFound) {
		callback(carsFound);
	});
};

CarSystem.prototype.register = function(car, callback) {
	Car.findOne({
		where: {
			userId: car.userId,
			licensePlate: car.licensePlate
		}
	}).then(function(foundCar) {
		if (!foundCar) {
			Car.create(car).then(function(createdCar) {
				callback(null, createdCar);
			});
		} else {
			callback(new Error('Ya existe un auto registrado con la patente: ' + car.licensePlate));
			return;
		}
	});
};

CarSystem.prototype.update = function(car, callback) {
	Car.findById(car.id).then(function(foundCar) {
		if (car.licensePlate != foundCar.licensePlate) {
			callback(new Error('No se puede modificar la patente'));
			return;
		}
		foundCar.update(car, {
			fields: ['model', 'color', 'hasAirConditioner']
		}).then(function() {
			foundCar.reload().then(function() {
				callback(null, foundCar);
			});
		});
	});
};

CarSystem.prototype.unregister = function(carId, callback) {
	Car.findById(carId).then(function(foundCar) {
		foundCar.destroy().then(function() {
			callback(null);
		});
	});
};

CarSystem.prototype.destroyAllCarsFor = function(user, callback) {
	Car.destroy({
		where: {
			userId: user.id
		}
	}).then(function(numberOfDeleted) {
		callback();
	});
};

module.exports = CarSystem;