var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var Travel = require('./travel')(sequelize);

	var SeatAsignation = sequelize.define('seat_asignation', {
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
		}
	}, {
		freezeTableName: true
	});

	return SeatAsignation;
};