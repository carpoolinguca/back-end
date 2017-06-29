var Sequelize;
var User;
var UserStatistics;

function UserStatisticsSystem(sequelize) {
	User = require('../models/user')(sequelize);
	UserStatistics = require('../models/user-statistics')(sequelize);
	Sequelize = sequelize;
}


UserStatisticsSystem.prototype.initializeUserStatisticsFor = function(user, callback) {
	userStatistics = {
		userId: user.id,
		passengerTravels: 0,
		driverTravels: 0,
		totalTravels: 0,
		distanceAsPassenger: 0,
		distanceAsDriver: 0,
		totalDistance: 0,
		passengersTransported: 0,
		driverCarbonFootprint: 0,
		driverSavedCarbonFootprint: 0,
		passengerSavedCarbonFootprint: 0,
		totalSavedCarbonFootprint: 0
	};
	UserStatistics.create(userStatistics).then(function(userStatisticsCreated) {
		callback(userStatisticsCreated);
	});
};

UserStatisticsSystem.prototype.userStatisticsForUserById = function(userId, callback) {
	UserStatistics.findOne({
		where: {
			userId: userId
		},
		attributes: ['id', 'userId', 'passengerTravels', 'driverTravels', 'totalTravels', 'distanceAsPassenger', 'distanceAsDriver', 'totalDistance', 'passengersTransported', 'driverCarbonFootprint', 'driverSavedCarbonFootprint', 'passengerSavedCarbonFootprint', 'totalSavedCarbonFootprint']
	}).then(function(userStatistics) {
		callback(userStatistics);
	});
};

UserStatisticsSystem.prototype.register = function(car, callback) {
	UserStatistics.findOne({
		where: {
			userId: car.userId,
			licensePlate: car.licensePlate
		}
	}).then(function(foundUserStatistics) {
		if (!foundUserStatistics) {
			UserStatistics.create(car).then(function(createdUserStatistics) {
				callback(null, createdUserStatistics);
			});
		} else {
			callback(new Error('Ya existe un auto registrado con la patente: ' + car.licensePlate));
			return;
		}
	});
};

UserStatisticsSystem.prototype.update = function(car, callback) {
	UserStatistics.findById(car.id).then(function(foundUserStatistics) {
		if (car.licensePlate != foundUserStatistics.licensePlate) {
			callback(new Error('No se puede modificar la patente'));
			return;
		}
		foundUserStatistics.update(car, {
			fields: ['model', 'color', 'hasAirConditioner']
		}).then(function() {
			foundUserStatistics.reload().then(function() {
				callback(null, foundUserStatistics);
			});
		});
	});
};

UserStatisticsSystem.prototype.unregister = function(carId, callback) {
	UserStatistics.findById(carId).then(function(foundUserStatistics) {
		foundUserStatistics.destroy().then(function() {
			callback(null);
		});
	});
};

UserStatisticsSystem.prototype.findById = function(carId, callback) {
	UserStatistics.findById(carId).then(function(foundUserStatistics) {
		if (!foundUserStatistics) {
			callback(new Error('No se ha encontrado un auto con el id: ' + carId));
			return;
		}
		callback(null, foundUserStatistics);
	});
};

UserStatisticsSystem.prototype.destroyUserStatisticsFor = function(user, callback) {
	UserStatistics.destroy({
		where: {
			userId: user.id
		}
	}).then(function(numberOfDeleted) {
		callback();
	});
};

module.exports = UserStatisticsSystem;