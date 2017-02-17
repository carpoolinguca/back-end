var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var User = require('./user')(sequelize);

	var Travel = sequelize.define('travel', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			},
			field : 'user_id'
		},
		origin: {
			type: Sequelize.STRING
		},
		destination: {
			type: Sequelize.STRING
		},
		userIsDriver: {
			type: Sequelize.BOOLEAN,
		},
		maximumSeats: {
			type: Sequelize.INTEGER,
		},
		availableSeats: {
			type: Sequelize.INTEGER,
		},
		arrivalDateTime: {
			type: Sequelize.DATE
		},
		observations: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	return Travel;
};