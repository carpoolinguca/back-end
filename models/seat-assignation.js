var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var Travel = require('./travel')(sequelize);

	var SeatAssignation = sequelize.define('seat_assignation', {
		parentTravel: {
			type: Sequelize.INTEGER,
			references: {
				model: Travel
			}
		},
		childTravel: {
			type: Sequelize.INTEGER,
			references: {
				model: Travel
			}
		},
		status: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	return SeatAssignation;
};