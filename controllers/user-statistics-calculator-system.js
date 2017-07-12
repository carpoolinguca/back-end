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