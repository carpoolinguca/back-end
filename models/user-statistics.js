var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var User = require('./user')(sequelize);

	var UserStatistics = sequelize.define('user_statistics', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		},
		passengerTravels: {
			type: Sequelize.INTEGER
		},
		driverTravels: {
			type: Sequelize.INTEGER
		},
		totalTravels: {
			type: Sequelize.INTEGER
		},
		distanceAsPassenger: {
			type: Sequelize.DOUBLE
		},
		distanceAsDriver: {
			type: Sequelize.DOUBLE
		},
		totalDistance: {
			type: Sequelize.DOUBLE
		},
		passengersTransported: {
			type: Sequelize.INTEGER
		},
		driverCarbonFootprint: {
			type: Sequelize.DOUBLE
		},
		driverSavedCarbonFootprint: {
			type: Sequelize.DOUBLE
		},
		passengerSavedCarbonFootprint: {
			type: Sequelize.DOUBLE
		},
		totalSavedCarbonFootprint: {
			type: Sequelize.DOUBLE
		},
	}, {
		freezeTableName: true
	});

	return UserStatistics;
};
