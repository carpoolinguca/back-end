var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var User = require('./user')(sequelize);

	var Travel = sequelize.define('user_statistics', {
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
		passengerTransported: {
			type: Sequelize.INTEGER
		},
		driverCarbonFootprint: {
			type: Sequelize.DOUBLE
		},
		driverSabedCarbonFootprint: {
			type: Sequelize.DOUBLE
		},
		passengerSabedCarbonFootprint: {
			type: Sequelize.DOUBLE
		},
		totalSabedCarbonFootprint: {
			type: Sequelize.DOUBLE
		},
	}, {
		freezeTableName: true
	});

	return Travel;
};