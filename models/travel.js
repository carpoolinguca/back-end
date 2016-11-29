var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var User = require('./user')(sequelize);

	var Travel = sequelize.define('travel', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		},
		origin: {
			type: Sequelize.STRING
		},
		destination: {
			type: Sequelize.STRING
		},
		userIsDriver: {
			type: Sequelize.BOOLEAN
		},
		seats: {
			type: Sequelize.INTEGER
		},
		arrivalDateTime: {
			type: Sequelize.DATE,
			field: 'arrival_date_time'
		},
		observations: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	return Travel;
};